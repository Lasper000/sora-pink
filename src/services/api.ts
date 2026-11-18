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
  PROMO_USER_USAGE: 'sora_pink_promo_usage_v1',
  NOTIFICATION_CONFIG: 'sora_pink_notify_config_v1',
};

const getEffectiveCartUnitPrice = (item: CartItem): number => {
  const base = item.product.discount_price ?? item.product.price;
  return item.bundleDiscountPercent
    ? Math.round(base * (1 - item.bundleDiscountPercent / 100))
    : base;
};

const sanitizeProductDbPayload = (p: Partial<Product>) => {
  const payload: Record<string, any> = {};
  const allowedFields: (keyof Product)[] = [
    'category_id',
    'name',
    'description',
    'ingredients',
    'how_to_use',
    'skin_types',
    'skin_concerns',
    'price',
    'discount_price',
    'stock_quantity',
    'images',
    'is_active',
  ];
  allowedFields.forEach((key) => {
    if (p[key] !== undefined) {
      payload[key] = p[key];
    }
  });
  return payload;
};

const mergeOrdersDedup = (primary: Order[], secondary: Order[]): Order[] => {
  const map = new Map<string, Order>();
  secondary.forEach((o) => map.set(o.id, o));
  primary.forEach((o) => {
    const prev = map.get(o.id);
    map.set(o.id, {
      ...prev,
      ...o,
      slip_url: o.slip_url || prev?.slip_url || null,
      admin_verified: o.admin_verified ?? prev?.admin_verified ?? false,
      verified_at: o.verified_at || prev?.verified_at || null,
      items: o.items && o.items.length > 0 ? o.items : prev?.items || [],
    });
  });
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

const mapSupabaseOrderRows = (
  rows: any[],
  localMetaMap: Map<string, Partial<Order>>
): Order[] => {
  return rows.map((o: any) => {
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
        const catMap = new Map<string, Category>();
        INITIAL_CATEGORIES.forEach((c) => catMap.set(c.id, c));

        // Trust live Supabase product data (including admin stock updates) when connected,
        // while keeping unseeded demo products from INITIAL_PRODUCTS available
        const prodMap = new Map<string, Product>();
        INITIAL_PRODUCTS.forEach((p) => {
          prodMap.set(p.id, p);
        });
        (data as Product[]).forEach((p) => {
          prodMap.set(p.id, p);
        });

        const mergedProducts = Array.from(prodMap.values()).map((p) => {
          if (!p.category && catMap.has(p.category_id)) {
            return { ...p, category: catMap.get(p.category_id) };
          }
          return p;
        });

        // Sync fresh server stock back to local cache
        setStoredData(STORAGE_KEYS.PRODUCTS, mergedProducts);
        return mergedProducts;
      }
      if (error) {
        console.warn('Supabase fetchProducts error, falling back to local:', error.message);
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
  const localReviews = getStoredData<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS).filter(
    (r) => r.product_id === productId
  );

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const dbReviews: Review[] = data.map((r: any) => ({
          id: r.id,
          product_id: r.product_id,
          user_id: r.user_id,
          rating: r.rating,
          comment: r.comment,
          images: Array.isArray(r.images) && r.images.length > 0 ? r.images : undefined,
          verified_buyer: Boolean(r.verified_buyer),
          created_at: r.created_at,
          user_name: r.profiles?.full_name || 'ลูกค้าผู้ใช้งาน',
          user_avatar: r.profiles?.avatar_url || '',
        }));

        // Merge local/demo reviews not present in Supabase response
        const seenKeys = new Set(dbReviews.map((r) => `${r.user_id}:${r.comment}`));
        const extraLocal = localReviews.filter((lr) => !seenKeys.has(`${lr.user_id}:${lr.comment}`));
        return [...dbReviews, ...extraLocal].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    } catch (err) {
      console.warn('Supabase fetchReviews error:', err);
    }
  }
  return localReviews;
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
  const cleanImages = images && images.length > 0 ? images : undefined;
  const newReview: Review = {
    id: 'rev-' + Date.now(),
    product_id: productId,
    user_id: userId,
    user_name: userName,
    user_avatar: userAvatar,
    rating,
    comment,
    images: cleanImages,
    verified_buyer: isVerifiedBuyer,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && !userId.startsWith('guest-') && !userId.startsWith('usr-')) {
    try {
      const { error } = await supabase.from('reviews').upsert(
        {
          product_id: productId,
          user_id: userId,
          rating,
          comment,
          images: cleanImages || [],
          verified_buyer: isVerifiedBuyer,
        },
        { onConflict: 'product_id,user_id' }
      );
      if (error) {
        // Fallback in case live PostgreSQL reviews table hasn't added images/verified_buyer yet
        const { error: fallbackErr } = await supabase.from('reviews').upsert(
          {
            product_id: productId,
            user_id: userId,
            rating,
            comment,
          },
          { onConflict: 'product_id,user_id' }
        );
        if (fallbackErr) {
          console.warn('Supabase upsert review error:', fallbackErr.message);
        }
      }
    } catch (err) {
      console.warn('Supabase insert review error:', err);
    }
  }

  // Upsert in LocalStorage per (product_id, user_id) for authenticated users, append for guests
  const reviews = getStoredData<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  const existingIdx =
    !userId.startsWith('guest-')
      ? reviews.findIndex((r) => r.product_id === productId && r.user_id === userId)
      : -1;
  if (existingIdx > -1) {
    reviews[existingIdx] = newReview;
  } else {
    reviews.unshift(newReview);
  }
  setStoredData(STORAGE_KEYS.REVIEWS, reviews);

  // Update cached product average rating & review count locally
  const productReviews = reviews.filter((r) => r.product_id === productId);
  if (productReviews.length > 0) {
    const avgRating =
      Math.round((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length) * 10) / 10;
    const products = getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setStoredData(
      STORAGE_KEYS.PRODUCTS,
      products.map((p) =>
        p.id === productId ? { ...p, rating: avgRating, review_count: productReviews.length } : p
      )
    );
  }

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
  slipUrl?: string | null,
  appliedPromoCode?: string
): Promise<Order> => {
  // Pre-validate stock availability in cached/live store
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
    price_at_purchase: getEffectiveCartUnitPrice(item),
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

  // If Supabase is connected and authenticated (non-demo/guest), insert order & order_items
  if (isSupabaseConfigured() && userId && !userId.startsWith('guest-') && !userId.startsWith('usr-')) {
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
      const { data: richOrder, error: richErr } = await supabase
        .from('orders')
        .insert({
          ...basePayload,
          slip_url: finalSlipUrl,
          admin_verified: false,
        })
        .select()
        .single();

      if (!richErr && richOrder) {
        dbOrder = richOrder;
      } else {
        // Fallback in case slip_url / admin_verified column is not yet migrated in PostgreSQL
        const { data: fallbackOrder, error: fallbackErr } = await supabase
          .from('orders')
          .insert(basePayload)
          .select()
          .single();
        if (!fallbackErr && fallbackOrder) {
          dbOrder = fallbackOrder;
        } else if (fallbackErr) {
          console.warn('Supabase place order insert error:', fallbackErr.message);
        }
      }

      if (dbOrder) {
        orderData.id = dbOrder.id;
        orderData.items = orderItems.map((oi) => ({ ...oi, order_id: dbOrder.id }));
        const dbItems = items.map((item) => ({
          order_id: dbOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: getEffectiveCartUnitPrice(item),
        }));
        // Automatic stock deduction trigger will run in PostgreSQL
        const { error: itemsErr } = await supabase.from('order_items').insert(dbItems);
        if (itemsErr) {
          console.warn('Supabase order_items insert error:', itemsErr.message);
        }
      }
    } catch (err) {
      console.warn('Supabase place order error:', err);
    }
  }

  // Stock deduction in Local Storage cache
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

  // Track promo usage if code applied
  if (appliedPromoCode) {
    incrementPromoUsage(appliedPromoCode, userId).catch(() => {});
  }

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

  const matchingLocalOrders = !userId
    ? localOrders
    : localOrders.filter((o) => o.user_id === userId || o.user_id === 'guest-user');

  if (isSupabaseConfigured() && userId && !userId.startsWith('guest-') && !userId.startsWith('usr-')) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const sbOrders = mapSupabaseOrderRows(data, localMetaMap);
        return mergeOrdersDedup(sbOrders, matchingLocalOrders);
      }
    } catch (err) {
      console.warn('Supabase fetch orders error:', err);
    }
  }

  return matchingLocalOrders;
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
        const sbOrders = mapSupabaseOrderRows(data, localMetaMap);
        // Merge Supabase orders with local-only Guest/offline orders so admins never lose visibility
        return mergeOrdersDedup(sbOrders, localOrders);
      }
    } catch (err) {
      console.warn('Supabase admin orders error:', err);
    }
  }
  return localOrders;
};

export const adminUpdateOrderStatus = async (
  orderId: string,
  status: Order['order_status'],
  trackingNumber?: string,
  paymentStatus?: Order['payment_status'],
  adminVerified?: boolean
): Promise<boolean> => {
  const orders = getStoredData<Order[]>(STORAGE_KEYS.ORDERS, []);
  const targetOrder = orders.find((o) => o.id === orderId);

  if (isSupabaseConfigured() && !orderId.startsWith('SP-')) {
    try {
      const corePayload: Record<string, any> = { order_status: status };
      if (trackingNumber !== undefined) corePayload.tracking_number = trackingNumber;
      if (paymentStatus !== undefined) corePayload.payment_status = paymentStatus;

      const fullPayload: Record<string, any> = { ...corePayload };
      if (adminVerified !== undefined) {
        fullPayload.admin_verified = adminVerified;
        if (adminVerified) fullPayload.verified_at = new Date().toISOString();
      }

      const { error } = await supabase.from('orders').update(fullPayload).eq('id', orderId);
      if (error) {
        const { error: fallbackErr } = await supabase
          .from('orders')
          .update(corePayload)
          .eq('id', orderId);
        if (fallbackErr) {
          console.warn('Supabase update order error:', fallbackErr.message);
        }
      }
    } catch (err) {
      console.warn('Supabase update order error:', err);
    }
  }

  // If status transitions to cancelled, restore stock for items back into store inventory
  if (status === 'cancelled' && targetOrder && targetOrder.order_status !== 'cancelled' && targetOrder.items) {
    const currentProducts = getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const restoredProducts = currentProducts.map((p) => {
      const returnedItem = targetOrder.items?.find((i) => i.product_id === p.id);
      if (returnedItem) {
        const restoredStock = p.stock_quantity + returnedItem.quantity;
        if (isSupabaseConfigured()) {
          supabase
            .from('products')
            .update({ stock_quantity: restoredStock })
            .eq('id', p.id)
            .then(({ error }) => {
              if (error) console.warn('Supabase restore stock error:', error.message);
            });
        }
        return {
          ...p,
          stock_quantity: restoredStock,
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
        const cleanPayload = sanitizeProductDbPayload(product);
        const { error } = await supabase.from('products').update(cleanPayload).eq('id', product.id!);
        if (error) {
          console.warn('Supabase update product error:', error.message);
        }
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
        const insertPayload = {
          id: targetProduct.id,
          ...sanitizeProductDbPayload(targetProduct),
          rating: targetProduct.rating,
          review_count: targetProduct.review_count,
        };
        const { error } = await supabase.from('products').insert([insertPayload]);
        if (error) {
          console.warn('Supabase insert product error:', error.message);
        }
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
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) {
        console.warn('Supabase delete product error:', error.message);
      }
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
// Dynamic Promo Code Management API (Admin Promo Manager + Supabase Sync)
// ----------------------------------------------------------------------------
const mapPromoFromDb = (row: any): PromoCode => ({
  code: String(row.code || '').toUpperCase(),
  discountPercent: row.discount_percent ?? undefined,
  discountAmount: row.discount_amount !== null && row.discount_amount !== undefined ? Number(row.discount_amount) : undefined,
  minSpend: row.min_spend !== null && row.min_spend !== undefined ? Number(row.min_spend) : 0,
  freeShipping: Boolean(row.free_shipping),
  description: row.description || '',
  maxUses: row.max_uses ?? null,
  usedCount: row.used_count ?? 0,
  onePerUser: Boolean(row.one_per_user),
  expiresAt: row.expires_at ?? null,
  isActive: row.is_active !== false,
});

const mapPromoToDb = (promo: PromoCode) => ({
  code: promo.code.trim().toUpperCase(),
  discount_percent: promo.discountPercent ?? null,
  discount_amount: promo.discountAmount ?? null,
  min_spend: promo.minSpend ?? 0,
  free_shipping: Boolean(promo.freeShipping),
  description: promo.description,
  max_uses: promo.maxUses ?? null,
  used_count: promo.usedCount ?? 0,
  one_per_user: Boolean(promo.onePerUser),
  expires_at: promo.expiresAt || null,
  is_active: promo.isActive !== false,
});

export const getStoredPromoCodes = (): PromoCode[] => {
  const stored = getStoredData<PromoCode[]>(STORAGE_KEYS.PROMO_CODES, PROMO_CODES);
  const map = new Map<string, PromoCode>();
  PROMO_CODES.forEach((p) => map.set(p.code.toUpperCase(), p));
  stored.forEach((p) => map.set(p.code.toUpperCase(), p));
  return Array.from(map.values());
};

export const fetchPromoCodes = async (): Promise<PromoCode[]> => {
  const localPromos = getStoredPromoCodes();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const map = new Map<string, PromoCode>();
        localPromos.forEach((p) => map.set(p.code.toUpperCase(), p));
        data.forEach((row: any) => {
          const mapped = mapPromoFromDb(row);
          map.set(mapped.code, mapped);
        });
        const merged = Array.from(map.values());
        setStoredData(STORAGE_KEYS.PROMO_CODES, merged);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('sora-promos-updated'));
        }
        return merged;
      }
    } catch {
      // Graceful fallback when promo_codes table isn't migrated yet
    }
  }
  return localPromos;
};

export const hasUserUsedPromo = (code: string, userId?: string): boolean => {
  const cleanCode = code.trim().toUpperCase();
  const usageMap = getStoredData<Record<string, string[]>>(STORAGE_KEYS.PROMO_USER_USAGE, {});
  const actorKey = userId && !userId.startsWith('guest-') ? userId : 'guest-browser';
  const usedList = usageMap[actorKey] || [];
  return usedList.includes(cleanCode);
};

export const validatePromoCode = (
  promo: PromoCode | undefined,
  subtotal: number,
  userId?: string
): { valid: boolean; reason?: string } => {
  if (!promo || promo.isActive === false) {
    return { valid: false, reason: 'โค้ดส่วนลดไม่ถูกต้องหรือถูกปิดใช้งานแล้วค่ะ' };
  }
  if (promo.expiresAt) {
    const expMs = new Date(promo.expiresAt).getTime();
    if (!Number.isNaN(expMs) && expMs < Date.now()) {
      return { valid: false, reason: `โค้ด "${promo.code}" หมดอายุการใช้งานแล้วค่ะ` };
    }
  }
  if (promo.maxUses && promo.maxUses > 0 && (promo.usedCount || 0) >= promo.maxUses) {
    return { valid: false, reason: `ขออภัย โค้ด "${promo.code}" ถูกใช้ครบจำนวนสิทธิ์แล้วค่ะ` };
  }
  if (promo.onePerUser && hasUserUsedPromo(promo.code, userId)) {
    return { valid: false, reason: `โค้ด "${promo.code}" จำกัด 1 สิทธิ์ต่อบัญชี คุณเคยใช้โค้ดนี้แล้วค่ะ` };
  }
  if (promo.minSpend && subtotal < promo.minSpend) {
    return {
      valid: false,
      reason: `ต้องมียอดซื้อขั้นต่ำ ฿${promo.minSpend.toLocaleString()} เพื่อใช้โค้ดนี้`,
    };
  }
  return { valid: true };
};

export const incrementPromoUsage = async (code: string, userId?: string): Promise<void> => {
  const cleanCode = code.trim().toUpperCase();
  const current = getStoredPromoCodes();
  let nextCount = 1;
  const nextList = current.map((p) => {
    if (p.code.toUpperCase() === cleanCode) {
      nextCount = (p.usedCount || 0) + 1;
      return { ...p, usedCount: nextCount };
    }
    return p;
  });
  setStoredData(STORAGE_KEYS.PROMO_CODES, nextList);

  const usageMap = getStoredData<Record<string, string[]>>(STORAGE_KEYS.PROMO_USER_USAGE, {});
  const actorKey = userId && !userId.startsWith('guest-') ? userId : 'guest-browser';
  const prevUsed = usageMap[actorKey] || [];
  if (!prevUsed.includes(cleanCode)) {
    usageMap[actorKey] = [...prevUsed, cleanCode];
    setStoredData(STORAGE_KEYS.PROMO_USER_USAGE, usageMap);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sora-promos-updated'));
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('promo_codes')
        .update({ used_count: nextCount })
        .eq('code', cleanCode);
    } catch {
      // Safe fallback
    }
  }
};

export const adminSavePromoCode = (promo: PromoCode): PromoCode[] => {
  const current = getStoredPromoCodes();
  const cleanCode = promo.code.trim().toUpperCase();
  const updatedPromo: PromoCode = {
    ...promo,
    code: cleanCode,
    usedCount: promo.usedCount ?? 0,
    isActive: promo.isActive !== false,
  };
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

  if (isSupabaseConfigured()) {
    supabase
      .from('promo_codes')
      .upsert(mapPromoToDb(updatedPromo), { onConflict: 'code' })
      .then(({ error }) => {
        if (error) console.warn('Supabase promo upsert note:', error.message);
      });
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

  if (isSupabaseConfigured()) {
    supabase
      .from('promo_codes')
      .delete()
      .eq('code', cleanCode)
      .then(({ error }) => {
        if (error) console.warn('Supabase promo delete note:', error.message);
      });
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
