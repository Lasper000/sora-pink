import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, PromoCode } from '../types';
import { PROMO_CODES } from '../lib/mockData';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  grandTotal: number;
  appliedPromo: PromoCode | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'sora_pink_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart:', e);
    }
  }, [cart]);

  // คำนวณยอดรวม
  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = item.product.discount_price ?? item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  // คำนวณส่วนลด
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountAmount) {
      discountAmount = appliedPromo.discountAmount;
    } else if (appliedPromo.discountPercent) {
      discountAmount = Math.round((subtotal * appliedPromo.discountPercent) / 100);
    }
  }

  // คำนวณค่าส่ง: ฟรีเมื่อซื้อครบ 500 บาท หรือใส่โค้ด FREESHIP มิฉะนั้น 50 บาท
  const shippingFee = (subtotal >= 500 || appliedPromo?.freeShipping || cart.length === 0) ? 0 : 50;

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // เพิ่มลงตะกร้าพร้อมตรวจสอบสต็อก
  const addToCart = (product: Product, quantity = 1): { success: boolean; message: string } => {
    if (product.stock_quantity <= 0) {
      return { success: false, message: 'ขออภัย สินค้าหมดชั่วคราว' };
    }

    const existingIndex = cart.findIndex((item) => item.product_id === product.id);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const newQty = currentQty + quantity;

      if (newQty > product.stock_quantity) {
        return {
          success: false,
          message: `ไม่สามารถเพิ่มสินค้าได้เกินสต็อกคงเหลือ (${product.stock_quantity} ชิ้น)`,
        };
      }

      const updated = [...cart];
      updated[existingIndex].quantity = newQty;
      setCart(updated);
      return { success: true, message: `เพิ่ม "${product.name}" ในตะกร้าแล้ว (${newQty} ชิ้น)` };
    } else {
      if (quantity > product.stock_quantity) {
        return {
          success: false,
          message: `สต็อกคงเหลือไม่เพียงพอ (คงเหลือ ${product.stock_quantity} ชิ้น)`,
        };
      }

      const newItem: CartItem = {
        id: 'cart-' + Math.random().toString(36).substring(2, 9),
        product_id: product.id,
        quantity,
        product,
      };
      setCart([...cart, newItem]);
      return { success: true, message: `เพิ่ม "${product.name}" ในตะกร้าแล้ว` };
    }
  };

  // ปรับจำนวนสินค้าในตะกร้า
  const updateQuantity = (productId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const item = cart.find((i) => i.product_id === productId);
    if (!item) return { success: false };

    if (quantity > item.product.stock_quantity) {
      return {
        success: false,
        message: `สต็อกคงเหลือเพียง ${item.product.stock_quantity} ชิ้นเท่านั้น`,
      };
    }

    setCart(
      cart.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    );
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  // ใช้คูปองส่วนลด
  const applyPromoCode = (codeStr: string): { success: boolean; message: string } => {
    const cleanCode = codeStr.trim().toUpperCase();
    const found = PROMO_CODES.find((p) => p.code === cleanCode);

    if (!found) {
      return { success: false, message: 'โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ' };
    }

    if (found.minSpend && subtotal < found.minSpend) {
      return {
        success: false,
        message: `ต้องมียอดซื้อขั้นต่ำ ฿${found.minSpend.toLocaleString()} เพื่อใช้โค้ดนี้`,
      };
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
