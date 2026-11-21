import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { CartItem, Product, PromoCode } from '../types';
import {
  fetchPromoCodes,
  getStoredPromoCodes,
  validatePromoCode,
} from '../services/api';
import { getActiveSeasonalFestival } from '../utils/seasonalTheme';
import { getEffectiveItemUnitPrice } from '../utils/cartMath';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedShade?: string
  ) => { success: boolean; message: string };
  addBundleToCart: (
    products: Product[],
    discountPercent: number,
    bundleLabel: string
  ) => { success: boolean; message: string };
  updateQuantity: (itemIdOrProductId: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (itemIdOrProductId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  grandTotal: number;
  appliedPromo: PromoCode | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  collectedVouchers: string[];
  collectVoucher: (code: string) => { success: boolean; message: string };
  isVoucherCollected: (code: string) => boolean;
  availableVouchers: PromoCode[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'sora_pink_cart';
const VOUCHER_STORAGE_KEY = 'sora_pink_vouchers';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isConfigured } = useAuth();
  const syncedUserRef = useRef<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [availableVouchers, setAvailableVouchers] = useState<PromoCode[]>(() => getStoredPromoCodes());

  useEffect(() => {
    const refreshPromos = () => setAvailableVouchers(getStoredPromoCodes());
    window.addEventListener('sora-promos-updated', refreshPromos);
    fetchPromoCodes().then((list) => setAvailableVouchers(list)).catch(() => {});
    return () => window.removeEventListener('sora-promos-updated', refreshPromos);
  }, []);

  const [collectedVouchers, setCollectedVouchers] = useState<string[]>(() => {
    const activeFestival = getActiveSeasonalFestival();
    const defaults = activeFestival?.promoCode
      ? ['WELCOMEPINK', activeFestival.promoCode]
      : ['WELCOMEPINK'];
    try {
      const saved = localStorage.getItem(VOUCHER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(VOUCHER_STORAGE_KEY, JSON.stringify(collectedVouchers));
    } catch (e) {
      console.warn('Failed to save vouchers:', e);
    }
  }, [collectedVouchers]);

  // Sync cart_items with Supabase when a live authenticated user signs in
  useEffect(() => {
    const activeUserId = isConfigured && user?.id ? user.id : null;
    if (!activeUserId) {
      syncedUserRef.current = null;
      return;
    }
    if (syncedUserRef.current === activeUserId) return;
    syncedUserRef.current = activeUserId;

    const syncCartFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .select('id, user_id, product_id, quantity, products(*)')
          .eq('user_id', activeUserId);
        if (error) return;

        setCart((prevLocal) => {
          const mergedMap = new Map<string, CartItem>();
          prevLocal.forEach((li) => mergedMap.set(li.product_id, li));

          (data || []).forEach((row: any) => {
            if (!row.products) return;
            const existing = mergedMap.get(row.product_id);
            const product = row.products as Product;
            const combinedQty = Math.min(
              Math.max(existing?.quantity || 0, row.quantity || 1),
              Math.max(1, product.stock_quantity)
            );
            mergedMap.set(row.product_id, {
              id: row.id || existing?.id || 'cart-' + Math.random().toString(36).substring(2, 9),
              user_id: activeUserId,
              product_id: row.product_id,
              quantity: combinedQty,
              product,
              bundleDiscountPercent: existing?.bundleDiscountPercent,
              bundleLabel: existing?.bundleLabel,
            });
          });

          const mergedList = Array.from(mergedMap.values());
          // Push local-only items up to Supabase
          const dbProductIds = new Set((data || []).map((r: any) => r.product_id));
          const toUpsert = prevLocal
            .filter((li) => !dbProductIds.has(li.product_id) && UUID_REGEX.test(li.product_id))
            .map((li) => ({
              user_id: activeUserId,
              product_id: li.product_id,
              quantity: li.quantity,
            }));
          if (toUpsert.length > 0) {
            supabase
              .from('cart_items')
              .upsert(toUpsert, { onConflict: 'user_id,product_id' })
              .then();
          }

          return mergedList;
        });
      } catch (err) {
        console.warn('Supabase cart sync note:', err);
      }
    };

    syncCartFromSupabase();
  }, [isConfigured, user?.id]);

  const syncCartItemToSupabase = (productId: string, quantity: number) => {
    if (!isConfigured || !user?.id || !UUID_REGEX.test(productId)) return;
    if (quantity <= 0) {
      supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .then();
    } else {
      supabase
        .from('cart_items')
        .upsert(
          { user_id: user.id, product_id: productId, quantity },
          { onConflict: 'user_id,product_id' }
        )
        .then();
    }
  };

  const collectVoucher = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    if (collectedVouchers.includes(cleanCode)) {
      return { success: false, message: 'คุณเก็บคูปองนี้ไปแล้วค่ะ' };
    }
    const updated = [...collectedVouchers, cleanCode];
    setCollectedVouchers(updated);
    return { success: true, message: `เก็บคูปอง "${cleanCode}" เข้ากระเป๋าเรียบร้อยแล้วค่ะ!` };
  };

  const isVoucherCollected = (code: string): boolean => {
    return collectedVouchers.includes(code.trim().toUpperCase());
  };

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart:', e);
    }
  }, [cart]);

  // คำนวณยอดรวม (รองรับส่วนลดเซต Bundle จริงในตะกร้า)
  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = getEffectiveItemUnitPrice(item);
    return sum + unitPrice * item.quantity;
  }, 0);

  // ยกเลิกโค้ดส่วนลดอัตโนมัติหากตะกร้าว่างหรือไม่ผ่านเงื่อนไขโค้ด
  useEffect(() => {
    if (appliedPromo) {
      if (cart.length === 0 || !validatePromoCode(appliedPromo, subtotal, user?.id).valid) {
        setAppliedPromo(null);
      }
    }
  }, [subtotal, cart.length, appliedPromo, user?.id]);

  // คำนวณส่วนลด (ตรวจสอบยอดขั้นต่ำเสมอ และจำกัดไม่ให้เกินราคาสินค้า)
  let discountAmount = 0;
  const isPromoEligible = appliedPromo && (!appliedPromo.minSpend || subtotal >= appliedPromo.minSpend);
  if (isPromoEligible && appliedPromo) {
    if (appliedPromo.discountAmount) {
      discountAmount = Math.min(subtotal, appliedPromo.discountAmount);
    } else if (appliedPromo.discountPercent) {
      discountAmount = Math.min(subtotal, Math.round((subtotal * appliedPromo.discountPercent) / 100));
    }
  }

  // คำนวณค่าส่ง: ฟรีเมื่อซื้อครบ 500 บาท หรือใส่โค้ดส่งฟรีที่ผ่านเกณฑ์ขั้นต่ำ มิฉะนั้น 50 บาท
  const shippingFee = (subtotal >= 500 || (isPromoEligible && appliedPromo?.freeShipping) || cart.length === 0) ? 0 : 50;

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // เพิ่มลงตะกร้าพร้อมตรวจสอบสต็อก (รองรับการแยกเฉดสี selectedShade)
  const addToCart = (
    product: Product,
    quantity = 1,
    selectedShade?: string
  ): { success: boolean; message: string } => {
    if (product.stock_quantity <= 0) {
      return { success: false, message: 'ขออภัย สินค้าหมดชั่วคราว' };
    }

    const cleanShade = selectedShade?.trim() || undefined;
    const totalSameProductInCart = cart
      .filter((item) => item.product_id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (totalSameProductInCart + quantity > product.stock_quantity) {
      return {
        success: false,
        message: `ไม่สามารถเพิ่มสินค้าได้เกินสต็อกคงเหลือ (${product.stock_quantity} ชิ้น)`,
      };
    }

    const existingIndex = cart.findIndex(
      (item) => item.product_id === product.id && (item.selectedShade || '') === (cleanShade || '')
    );
    const shadeLabel = cleanShade ? ` (${cleanShade})` : '';

    if (existingIndex > -1) {
      const newQty = cart[existingIndex].quantity + quantity;
      const updated = [...cart];
      updated[existingIndex] = { ...updated[existingIndex], quantity: newQty, product };
      setCart(updated);
      syncCartItemToSupabase(product.id, totalSameProductInCart + quantity);
      return { success: true, message: `เพิ่ม "${product.name}${shadeLabel}" ในตะกร้าแล้ว (${newQty} ชิ้น)` };
    } else {
      const newItem: CartItem = {
        id: 'cart-' + Math.random().toString(36).substring(2, 9),
        product_id: product.id,
        quantity,
        product,
        selectedShade: cleanShade,
      };
      setCart([...cart, newItem]);
      syncCartItemToSupabase(product.id, totalSameProductInCart + quantity);
      return { success: true, message: `เพิ่ม "${product.name}${shadeLabel}" ในตะกร้าแล้ว` };
    }
  };

  // เพิ่มสินค้าเป็นเซต (Bundle) พร้อมส่วนลดจริงในตะกร้า
  const addBundleToCart = (
    products: Product[],
    discountPercent: number,
    bundleLabel: string
  ): { success: boolean; message: string } => {
    if (!products || products.length === 0) {
      return { success: false, message: 'ไม่พบสินค้าในเซตที่เลือก' };
    }

    // Count required quantities per product ID in case a set includes duplicate/repeated SKUs
    const neededCounts = new Map<string, number>();
    products.forEach((p) => {
      neededCounts.set(p.id, (neededCounts.get(p.id) || 0) + 1);
    });

    for (const p of products) {
      if (p.stock_quantity <= 0) {
        return { success: false, message: `ขออภัย "${p.name}" ในเซตหมดสต็อกชั่วคราว` };
      }
      const existing = cart.find((item) => item.product_id === p.id);
      const nextQty = (existing?.quantity || 0) + (neededCounts.get(p.id) || 1);
      if (nextQty > p.stock_quantity) {
        return {
          success: false,
          message: `สต็อกของ "${p.name}" คงเหลือไม่เพียงพอสำหรับเพิ่มเซตนี้ (เหลือ ${p.stock_quantity} ชิ้น)`,
        };
      }
    }

    const updatedCart = [...cart];
    products.forEach((p) => {
      const idx = updatedCart.findIndex((item) => item.product_id === p.id);
      if (idx > -1) {
        const current = updatedCart[idx];
        const nextQty = current.quantity + 1;
        updatedCart[idx] = {
          ...current,
          quantity: nextQty,
          product: p,
          bundleDiscountPercent: Math.max(current.bundleDiscountPercent || 0, discountPercent),
          bundleLabel: current.bundleLabel || bundleLabel,
        };
        syncCartItemToSupabase(p.id, nextQty);
      } else {
        updatedCart.push({
          id: 'cart-' + Math.random().toString(36).substring(2, 9),
          product_id: p.id,
          quantity: 1,
          product: p,
          bundleDiscountPercent: discountPercent,
          bundleLabel,
        });
        syncCartItemToSupabase(p.id, 1);
      }
    });

    setCart(updatedCart);
    return {
      success: true,
      message: `เพิ่มเซต "${bundleLabel}" (${products.length} ชิ้น) พร้อมส่วนลดเซต ${discountPercent}% ลงตะกร้าแล้ว!`,
    };
  };

  // ปรับจำนวนสินค้าในตะกร้า (รองรับทั้ง CartItem.id และ product_id)
  const updateQuantity = (
    itemIdOrProductId: string,
    quantity: number
  ): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(itemIdOrProductId);
      return { success: true };
    }

    const item = cart.find((i) => i.id === itemIdOrProductId || i.product_id === itemIdOrProductId);
    if (!item) return { success: false };

    const otherShadesQty = cart
      .filter((i) => i.product_id === item.product_id && i.id !== item.id)
      .reduce((sum, i) => sum + i.quantity, 0);

    if (otherShadesQty + quantity > item.product.stock_quantity) {
      return {
        success: false,
        message: `สต็อกคงเหลือเพียง ${item.product.stock_quantity} ชิ้นเท่านั้น`,
      };
    }

    setCart(cart.map((i) => (i.id === item.id ? { ...i, quantity } : i)));
    syncCartItemToSupabase(item.product_id, otherShadesQty + quantity);
    return { success: true };
  };

  const removeFromCart = (itemIdOrProductId: string) => {
    const target = cart.find((i) => i.id === itemIdOrProductId || i.product_id === itemIdOrProductId);
    if (!target) return;
    const remaining = cart.filter((item) => item.id !== target.id);
    setCart(remaining);
    const remainingSameProdQty = remaining
      .filter((i) => i.product_id === target.product_id)
      .reduce((sum, i) => sum + i.quantity, 0);
    syncCartItemToSupabase(target.product_id, remainingSameProdQty);
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    if (isConfigured && user?.id) {
      supabase.from('cart_items').delete().eq('user_id', user.id).then();
    }
  };

  // ใช้คูปองส่วนลด (ตรวจสอบวันหมดอายุ, จำนวนสิทธิ์สูงสุด, สิทธิ์ต่อบัญชี และยอดซื้อขั้นต่ำ)
  const applyPromoCode = (codeStr: string): { success: boolean; message: string } => {
    const cleanCode = codeStr.trim().toUpperCase();
    const livePromos = getStoredPromoCodes();
    const found = livePromos.find((p) => p.code.toUpperCase() === cleanCode);

    const validation = validatePromoCode(found, subtotal, user?.id);
    if (!validation.valid || !found) {
      return { success: false, message: validation.reason || 'โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ' };
    }

    setAppliedPromo(found);
    return { success: true, message: `ใช้โค้ด ${found.code} สำเร็จ! (${found.description})` };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addBundleToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotal,
        discountAmount,
        shippingFee,
        grandTotal,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        collectedVouchers,
        collectVoucher,
        isVoucherCollected,
        availableVouchers,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
