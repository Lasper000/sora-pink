// ============================================================================
// SORA PINK - UNIFIED API SERVICE (SUPABASE LIVE + LOCALSTORAGE DEMO STORE)
// ============================================================================
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_REVIEWS, PROMO_CODES } from '../lib/mockData';
import type {
  Category,
  Product,
  Review,
  Order,
  OrderItem,
  ShippingAddress,
  CartItem,
  PromoCode,
  AdminNotificationConfig,
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'sora_pink_products',
  CATEGORIES: 'sora_pink_categories',
  REVIEWS: 'sora_pink_reviews',
  ORDERS: 'sora_pink_orders',
  WISHLIST: 'sora_pink_wishlist',
  PROMO_CODES: 'sora_pink_promos_v1',
  NOTIFICATION_CONFIG: 'sora_pink_notify_config_v1',
};

// ----------------------------------------------------------------------------
// Local Storage Helper Initialization
// ----------------------------------------------------------------------------
const getStoredData = <T>(key: string, defaultVal: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
};

const setStoredData = <T>(key: string, val: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
};

const BROKEN_CATEGORY_URLS: Record<string, string> = {
  'photo-1608248597359-5776d655f464': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
  'photo-1567928815116-2c6f6004dc5c': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
};

export const sanitizeCategory = (cat: Category): Category => {
  let url = cat.image_url;
  for (const [brokenKey, validUrl] of Object.entries(BROKEN_CATEGORY_URLS)) {
    if (url && url.includes(brokenKey)) {
      url = validUrl;
      // Auto-heal Supabase database in background if connected
      if (isSupabaseConfigured()) {
        try {
          supabase.from('categories').update({ image_url: validUrl }).eq('id', cat.id).then();
        } catch {
          // ignore
        }
      }
      break;
    }
  }
  return { ...cat, image_url: url };
};

// Initialize Mock store in browser if not already there
if (typeof window !== 'undefined') {
  // Categories sync
  const existingCats = getStoredData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const catMap = new Map<string, Category>();
  existingCats.forEach((c) => catMap.set(c.id, sanitizeCategory(c)));
  INITIAL_CATEGORIES.forEach((ic) => catMap.set(ic.id, sanitizeCategory(ic)));
  setStoredData(STORAGE_KEYS.CATEGORIES, Array.from(catMap.values()));

  const existingProds = getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  // Ensure all initial products are up to date while preserving modified stock levels
  const prodMap = new Map<string, Product>();
  INITIAL_PRODUCTS.forEach((ip) => prodMap.set(ip.id, ip));
  existingProds.forEach((p) => {
    const existing = prodMap.get(p.id);
    if (existing) {
      prodMap.set(p.id, { ...existing, stock_quantity: p.stock_quantity });
    } else {
      prodMap.set(p.id, p);
    }
  });
  setStoredData(STORAGE_KEYS.PRODUCTS, Array.from(prodMap.values()));

  // Reviews sync
  const existingReviews = getStoredData<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  const reviewMap = new Map<string, Review>();
  existingReviews.forEach((r) => reviewMap.set(r.id, r));
  INITIAL_REVIEWS.forEach((ir) => reviewMap.set(ir.id, ir));
  setStoredData(STORAGE_KEYS.REVIEWS, Array.from(reviewMap.values()));

  getStoredData(STORAGE_KEYS.ORDERS, []);
}

// ----------------------------------------------------------------------------
// Categories API
// ----------------------------------------------------------------------------
export const fetchCategories = async (): Promise<Category[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data && data.length > 0) {
        // Merge Supabase categories with INITIAL_CATEGORIES to ensure all 9 categories are always available
        const catMap = new Map<string, Category>();
        INITIAL_CATEGORIES.forEach((c) => catMap.set(c.id, sanitizeCategory(c)));
        (data as Category[]).forEach((c) => catMap.set(c.id, sanitizeCategory(c)));
        return Array.from(catMap.values());
      }
    } catch (err) {
      console.warn('Supabase fetchCategories error, falling back to local:', err);
    }
  }
  const local = getStoredData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  return local.map(sanitizeCategory);
};

// ----------------------------------------------------------------------------
// Products API
// ----------------------------------------------------------------------------
export const fetchProducts = async (): Promise<Product[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Read local storage to preserve any stock deductions from orders
        const localProds = getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
        const localStockMap = new Map<string, number>();
        localProds.forEach((lp) => {
          if (typeof lp.stock_quantity === 'number') {
            localStockMap.set(lp.id, lp.stock_quantity);
          }
        });

        // Merge Supabase products with INITIAL_PRODUCTS to guarantee all products are loaded
        const prodMap = new Map<string, Product>();
        INITIAL_PRODUCTS.forEach((p) => {
          const effectiveStock = localStockMap.has(p.id)
            ? Math.min(p.stock_quantity, localStockMap.get(p.id)!)
            : p.stock_quantity;
          prodMap.set(p.id, { ...p, stock_quantity: effectiveStock });
        });
        (data as Product[]).forEach((p) => {
          const effectiveStock = localStockMap.has(p.id)
            ? Math.min(p.stock_quantity, localStockMap.get(p.id)!)
            : p.stock_quantity;
          prodMap.set(p.id, { ...p, stock_quantity: effectiveStock });
        });
        
        // Attach category object if not populated
        const catMap = new Map<string, Category>();
        INITIAL_CATEGORIES.forEach((c) => catMap.set(c.id, c));
        
        return Array.from(prodMap.values()).map((p) => {
          if (!p.category && catMap.has(p.category_id)) {
            return { ...p, category: catMap.get(p.category_id) };
          }
          return p;
        });
      }
    } catch (err) {
      console.warn('Supabase fetchProducts error, falling back to local:', err);
    }
  }
  
  const catMap = new Map<string, Category>();
  INITIAL_CATEGORIES.forEach((c) => catMap.set(c.id, c));
  const localList = getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  return localList.map((p) => {
    if (!p.category && catMap.has(p.category_id)) {
      return { ...p, category: catMap.get(p.category_id) };
    }
    return p;
  });
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (data) return data as Product;
    } catch (err) {
      console.warn('Supabase fetchProductById error, fallback:', err);
    }
  }
  const products = getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  return products.find((p) => p.id === id) || null;
};

// ----------------------------------------------------------------------------
// Reviews API
// ----------------------------------------------------------------------------
export const fetchReviewsByProductId = async (productId: string): Promise<Review[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        return data.map((r: any) => ({
          id: r.id,
          product_id: r.product_id,
          user_id: r.user_id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          user_name: r.profiles?.full_name || 'ลูกค้าผู้ใช้งาน',
          user_avatar: r.profiles?.avatar_url || '',
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchReviews error:', err);
    }
  }
  const allReviews = getStoredData<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  return allReviews.filter((r) => r.product_id === productId);
};

export const hasUserPurchasedProduct = (userId: string | undefined, productId: string): boolean => {
  if (!userId) return false;
  const allOrders = getStoredData<Order[]>(STORAGE_KEYS.ORDERS, []);
  return allOrders.some(
    (o) =>
      o.user_id === userId &&
      o.order_status !== 'cancelled' &&
      (o.items || []).some((item) => item.product_id === productId)
  );
};

export const submitProductReview = async (
  productId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  rating: number,
  comment: string,
  images?: string[]
): Promise<Review> => {
  const isVerifiedBuyer = hasUserPurchasedProduct(userId, productId) || !userId.startsWith('guest-');
  const newReview: Review = {
    id: 'rev-' + Date.now(),
    product_id: productId,
    user_id: userId,
    user_name: userName,
    user_avatar: userAvatar,
    rating,
    comment,
    images: images && images.length > 0 ? images : undefined,
    verified_buyer: isVerifiedBuyer,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('reviews').insert({
        product_id: productId,
        user_id: userId,
        rating,
        comment,
      });
    } catch (err) {
      console.warn('Supabase insert review error:', err);
    }
  }

  // Update in LocalStorage
  const reviews = getStoredData<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  reviews.unshift(newReview);
  setStoredData(STORAGE_KEYS.REVIEWS, reviews);

  return newReview;
};

// ----------------------------------------------------------------------------
// Order & Stock Management API
// ----------------------------------------------------------------------------
export const placeNewOrder = async (
  userId: string | undefined,
  items: CartItem[],
  totalAmount: number,
  discountAmount: number,
  shippingFee: number,
  shippingAddress: ShippingAddress,
  paymentMethod: Order['payment_method'],
  slipUrl?: string | null
): Promise<Order> => {
  // Pre-validate stock availability in local store
  const currentProducts = getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  for (const item of items) {
    const liveProd = currentProducts.find((p) => p.id === item.product_id);
    if (liveProd && liveProd.stock_quantity < item.quantity) {
      throw new Error(`ขออภัยค่ะ สินค้า "${item.product.name}" มีจำนวนคงเหลือไม่เพียงพอ (เหลือ ${liveProd.stock_quantity} ชิ้น)`);
    }
  }

  const orderId = 'SP-' + Date.now().toString().slice(-8);

  const orderItems: OrderItem[] = items.map((item) => ({
    id: 'item-' + Math.random().toString(36).substring(2, 9),
    order_id: orderId,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.product.discount_price ?? item.product.price,
    product: item.product,
  }));

  // Upload slip image to Supabase Storage bucket ('order-slips') if connected
  let finalSlipUrl = slipUrl || null;
  if (isSupabaseConfigured() && slipUrl && slipUrl.startsWith('data:image/')) {
    try {
      const res = await fetch(slipUrl);
      const blob = await res.blob();
      const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
      const filePath = `${userId || 'guest'}/${orderId}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('order-slips')
        .upload(filePath, blob, { contentType: blob.type, upsert: true });
      if (!uploadErr) {
        const { data: pubData } = supabase.storage.from('order-slips').getPublicUrl(filePath);
        if (pubData?.publicUrl) {
          finalSlipUrl = pubData.publicUrl;
        }
      }
    } catch {
      // Safe fallback to compressed Data URL
    }
  }

  const orderData: Order = {
    id: orderId,
    user_id: userId || 'guest-user',
    total_amount: totalAmount,
    discount_amount: discountAmount,
    shipping_fee: shippingFee,
    shipping_address: shippingAddress,
    payment_method: paymentMethod,
    payment_status: 'pending',
    order_status: 'pending', // Requires admin inspection & confirmation before proceeding
    tracking_number: null,
    slip_url: finalSlipUrl,
    admin_verified: false,
    verified_at: null,
    created_at: new Date().toISOString(),
    items: orderItems,
  };

  // If Supabase is connected, insert order & order_items
  if (isSupabaseConfigured() && userId && !userId.startsWith('guest-')) {
    try {
      const basePayload: any = {
        user_id: userId,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        payment_status: 'pending',
        order_status: 'pending',
      };

      let dbOrder: any = null;
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            ...basePayload,
            slip_url: finalSlipUrl,
            admin_verified: false,
          })
          .select()
          .single();
        if (!error && data) dbOrder = data;
      } catch {
        // Fallback in case slip_url column is not yet migrated in PostgreSQL
      }

      if (!dbOrder) {
        const { data, error } = await supabase
          .from('orders')
          .insert(basePayload)
          .select()
          .single();
        if (!error && data) dbOrder = data;
      }

      if (dbOrder) {
        orderData.id = dbOrder.id;
        const dbItems = items.map((item) => ({
          order_id: dbOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: item.product.discount_price ?? item.product.price,
        }));
        // Automatic stock deduction trigger will run in PostgreSQL
        await supabase.from('order_items').insert(dbItems);
      }
    } catch (err) {
      console.warn('Supabase place order error:', err);
    }
  }

  // Stock deduction in Mock / Local Storage
  const liveProducts = getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updatedProducts = liveProducts.map((p) => {
    const purchased = items.find((i) => i.product_id === p.id);
    if (purchased) {
      return {
        ...p,
        stock_quantity: Math.max(0, p.stock_quantity - purchased.quantity),
      };
    }
    return p;
  });
  setStoredData(STORAGE_KEYS.PRODUCTS, updatedProducts);

  // Save order in LocalStorage
  const orders = getStoredData<Order[]>(STORAGE_KEYS.ORDERS, []);
  orders.unshift(orderData);
  setStoredData(STORAGE_KEYS.ORDERS, orders);

  // Trigger instant notification alert (Telegram / Webhook) in background
  sendOrderNotificationAlert(orderData).catch(() => {});

  return orderData;
};

export const fetchOrders = async (userId?: string): Promise<Order[]> => {
  const localOrders = getStoredData<Order[]>(STORAGE_KEYS.ORDERS, []);
  const localMetaMap = new Map<string, Partial<Order>>();
  localOrders.forEach((lo) => {
    localMetaMap.set(lo.id, {
      slip_url: lo.slip_url,
      admin_verified: lo.admin_verified,
      verified_at: lo.verified_at,
    });
  });

  if (isSupabaseConfigured() && userId && !userId.startsWith('guest-')) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((o: any) => {
          const localMeta = localMetaMap.get(o.id) || {};
          return {
            ...o,
            slip_url: o.slip_url || localMeta.slip_url || null,
            admin_verified: o.admin_verified ?? localMeta.admin_verified ?? false,
            verified_at: o.verified_at || localMeta.verified_at || null,
            items: (o.order_items || []).map((oi: any) => ({
              id: oi.id,
              order_id: oi.order_id,
              product_id: oi.product_id,
              quantity: oi.quantity,
              price_at_purchase: oi.price_at_purchase,
              product: oi.products,
            })),
          };
        });
      }
    } catch (err) {
      console.warn('Supabase fetch orders error:', err);
    }
  }

  const allOrders = getStoredData<Order[]>(STORAGE_KEYS.ORDERS, []);
  if (!userId) return allOrders;
  return allOrders.filter((o) => o.user_id === userId || o.user_id === 'guest-user');
};

// ----------------------------------------------------------------------------
// Admin Dashboard Operations (Product CRUD & Order Updates)
// ----------------------------------------------------------------------------
export const adminFetchAllOrders = async (): Promise<Order[]> => {
  const localOrders = getStoredData<Order[]>(STORAGE_KEYS.ORDERS, []);
  const localMetaMap = new Map<string, Partial<Order>>();
  localOrders.forEach((lo) => {
    localMetaMap.set(lo.id, {
      slip_url: lo.slip_url,
      admin_verified: lo.admin_verified,
      verified_at: lo.verified_at,
    });
  });

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        return data.map((o: any) => {
          const localMeta = localMetaMap.get(o.id) || {};
          return {
            ...o,
            slip_url: o.slip_url || localMeta.slip_url || null,
            admin_verified: o.admin_verified ?? localMeta.admin_verified ?? false,
            verified_at: o.verified_at || localMeta.verified_at || null,
            items: (o.order_items || []).map((oi: any) => ({
              id: oi.id,
              order_id: oi.order_id,
              product_id: oi.product_id,
              quantity: oi.quantity,
              price_at_purchase: oi.price_at_purchase,
              product: oi.products,
            })),
          };
        });
      }
    } catch (err) {
      console.warn('Supabase admin orders error:', err);
    }
  }
  return getStoredData<Order[]>(STORAGE_KEYS.ORDERS, []);
};

export const adminUpdateOrderStatus = async (
  orderId: string,
  status: Order['order_status'],
  trackingNumber?: string,
  paymentStatus?: Order['payment_status'],
  adminVerified?: boolean
): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const updatePayload: any = { order_status: status };
      if (trackingNumber !== undefined) updatePayload.tracking_number = trackingNumber;
      if (paymentStatus !== undefined) updatePayload.payment_status = paymentStatus;
      if (adminVerified !== undefined) {
        updatePayload.admin_verified = adminVerified;
        if (adminVerified) updatePayload.verified_at = new Date().toISOString();
      }
      await supabase.from('orders').update(updatePayload).eq('id', orderId);
    } catch (err) {
      console.warn('Supabase update order error:', err);
    }
  }

  const orders = getStoredData<Order[]>(STORAGE_KEYS.ORDERS, []);
  const targetOrder = orders.find((o) => o.id === orderId);

  // If status transitions to cancelled, restore stock for items back into store inventory
  if (status === 'cancelled' && targetOrder && targetOrder.order_status !== 'cancelled' && targetOrder.items) {
    const currentProducts = getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const restoredProducts = currentProducts.map((p) => {
      const returnedItem = targetOrder.items?.find((i) => i.product_id === p.id);
      if (returnedItem) {
        return {
          ...p,
          stock_quantity: p.stock_quantity + returnedItem.quantity,
        };
      }
      return p;
    });
    setStoredData(STORAGE_KEYS.PRODUCTS, restoredProducts);
  }

  const updatedOrders = orders.map((o) => {
    if (o.id === orderId) {
      return {
        ...o,
        order_status: status,
        tracking_number: trackingNumber !== undefined ? trackingNumber : o.tracking_number,
        payment_status: paymentStatus !== undefined ? paymentStatus : o.payment_status,
        admin_verified: adminVerified !== undefined ? adminVerified : o.admin_verified,
        verified_at: adminVerified ? new Date().toISOString() : o.verified_at,
        updated_at: new Date().toISOString(),
      };
    }
    return o;
  });
  setStoredData(STORAGE_KEYS.ORDERS, updatedOrders);
  return true;
};

export const adminVerifyOrderSlip = async (
  orderId: string,
  approved: boolean
): Promise<boolean> => {
  return adminUpdateOrderStatus(
    orderId,
    approved ? 'processing' : 'cancelled',
    undefined,
    approved ? 'paid' : 'failed',
    approved
  );
};

export const adminSaveProduct = async (product: Partial<Product>): Promise<Product> => {
  const isEditing = Boolean(product.id);
  const products = getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);

  let targetProduct: Product;

  if (isEditing) {
    targetProduct = {
      ...products.find((p) => p.id === product.id)!,
      ...product,
      updated_at: new Date().toISOString(),
    } as Product;

    const updatedList = products.map((p) => (p.id === targetProduct.id ? targetProduct : p));
    setStoredData(STORAGE_KEYS.PRODUCTS, updatedList);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('products').update(product).eq('id', product.id!);
      } catch (err) {
        console.warn('Supabase update product error:', err);
      }
    }
  } else {
    const generatedUuid =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
    targetProduct = {
      id: generatedUuid,
      category_id: product.category_id || INITIAL_CATEGORIES[0].id,
      name: product.name || 'สินค้าใหม่',
      description: product.description || '',
      ingredients: product.ingredients || '',
      how_to_use: product.how_to_use || '',
      skin_types: product.skin_types || ['ทุกสภาพผิว'],
      skin_concerns: product.skin_concerns || ['ความชุ่มชื้น'],
      price: product.price || 0,
      discount_price: product.discount_price || null,
      stock_quantity: product.stock_quantity ?? 10,
      images: product.images?.length ? product.images : ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'],
      is_active: product.is_active ?? true,
      created_at: new Date().toISOString(),
      rating: 5.0,
      review_count: 0,
    };

    products.unshift(targetProduct);
    setStoredData(STORAGE_KEYS.PRODUCTS, products);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('products').insert([targetProduct]);
      } catch (err) {
        console.warn('Supabase insert product error:', err);
      }
    }
  }

  return targetProduct;
};

export const adminDeleteProduct = async (productId: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (err) {
      console.warn('Supabase delete product error:', err);
    }
  }

  const products = getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const filtered = products.filter((p) => p.id !== productId);
  setStoredData(STORAGE_KEYS.PRODUCTS, filtered);
  return true;
};

// ----------------------------------------------------------------------------
// Dynamic Promo Code Management API (Admin Promo Manager)
// ----------------------------------------------------------------------------
export const getStoredPromoCodes = (): PromoCode[] => {
  const stored = getStoredData<PromoCode[]>(STORAGE_KEYS.PROMO_CODES, PROMO_CODES);
  const map = new Map<string, PromoCode>();
  PROMO_CODES.forEach((p) => map.set(p.code.toUpperCase(), p));
  stored.forEach((p) => map.set(p.code.toUpperCase(), p));
  return Array.from(map.values());
};

export const adminSavePromoCode = (promo: PromoCode): PromoCode[] => {
  const current = getStoredPromoCodes();
  const cleanCode = promo.code.trim().toUpperCase();
  const updatedPromo: PromoCode = { ...promo, code: cleanCode };
  const existsIdx = current.findIndex((p) => p.code.toUpperCase() === cleanCode);
  let nextList: PromoCode[];
  if (existsIdx > -1) {
    nextList = current.map((p, i) => (i === existsIdx ? updatedPromo : p));
  } else {
    nextList = [updatedPromo, ...current];
  }
  setStoredData(STORAGE_KEYS.PROMO_CODES, nextList);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sora-promos-updated'));
  }
  return nextList;
};

export const adminDeletePromoCode = (code: string): PromoCode[] => {
  const current = getStoredPromoCodes();
  const cleanCode = code.trim().toUpperCase();
  const nextList = current.filter((p) => p.code.toUpperCase() !== cleanCode);
  setStoredData(STORAGE_KEYS.PROMO_CODES, nextList);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sora-promos-updated'));
  }
  return nextList;
};

// ----------------------------------------------------------------------------
// Real-time Order Notification Alert (Telegram Bot & Custom Webhook)
// ----------------------------------------------------------------------------
const DEFAULT_NOTIFY_CONFIG: AdminNotificationConfig = {
  enabled: false,
  telegramBotToken: '',
  telegramChatId: '',
  webhookUrl: '',
};

export const getNotificationConfig = (): AdminNotificationConfig => {
  return getStoredData<AdminNotificationConfig>(STORAGE_KEYS.NOTIFICATION_CONFIG, DEFAULT_NOTIFY_CONFIG);
};

export const saveNotificationConfig = (config: AdminNotificationConfig): void => {
  setStoredData(STORAGE_KEYS.NOTIFICATION_CONFIG, config);
};

export const sendOrderNotificationAlert = async (
  order: Order,
  isTest = false
): Promise<{ sent: boolean; message: string }> => {
  const config = getNotificationConfig();
  if (!config.enabled && !isTest) {
    return { sent: false, message: 'ระบบแจ้งเตือนปิดอยู่' };
  }

  const itemSummary = (order.items || [])
    .map((i) => `• ${i.product?.name || i.product_id} (x${i.quantity})`)
    .join('\n');

  const textMsg =
    `${isTest ? '🔔 [ทดสอบระบบแจ้งเตือน] ' : '🛍️ [ออเดอร์ใหม่ SORA PINK] '}\n` +
    `━━━━━━━━━━━━━━━\n` +
    `📦 เลขออเดอร์: ${order.id}\n` +
    `👤 ลูกค้า: ${order.shipping_address.fullName} (${order.shipping_address.phone})\n` +
    `💳 ช่องทางชำระ: ${order.payment_method.toUpperCase()}${order.slip_url ? ' (แนบสลิปแล้ว ✅)' : ''}\n` +
    `💰 ยอดสุทธิ: ฿${order.total_amount.toLocaleString()}\n` +
    `📍 ที่อยู่: ${order.shipping_address.address} จ.${order.shipping_address.province} ${order.shipping_address.postalCode}\n` +
    (itemSummary ? `📋 รายการสินค้า:\n${itemSummary}\n` : '') +
    `━━━━━━━━━━━━━━━\n` +
    `⏳ สถานะ: รอแอดมินตรวจสอบและยืนยันในระบบหลังบ้าน`;

  let sentAny = false;

  // 1. Send via Telegram Bot API if configured
  if (config.telegramBotToken.trim() && config.telegramChatId.trim()) {
    try {
      const tgUrl = `https://api.telegram.org/bot${config.telegramBotToken.trim()}/sendMessage`;
      const res = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegramChatId.trim(),
          text: textMsg,
        }),
      });
      if (res.ok) sentAny = true;
    } catch (err) {
      console.warn('Telegram notification error:', err);
    }
  }

  // 2. Send via Custom / Discord / Make / Zapier / LINE Proxy Webhook if configured
  if (config.webhookUrl.trim()) {
    try {
      const res = await fetch(config.webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textMsg,
          text: textMsg,
          order_id: order.id,
          total_amount: order.total_amount,
          customer: order.shipping_address.fullName,
          payment_method: order.payment_method,
        }),
      });
      if (res.ok) sentAny = true;
    } catch (err) {
      console.warn('Webhook notification error:', err);
    }
  }

  if (sentAny) {
    return { sent: true, message: 'ส่งแจ้งเตือนออเดอร์เข้าช่องทางที่ตั้งค่าไว้สำเร็จแล้วค่ะ!' };
  }
  return {
    sent: false,
    message: 'ยังไม่ได้ระบุ Telegram Bot Token / Chat ID หรือ Webhook URL ที่ถูกต้องค่ะ',
  };
};
