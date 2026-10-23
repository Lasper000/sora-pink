// ============================================================================
// SORA PINK - UNIFIED API SERVICE (SUPABASE LIVE + LOCALSTORAGE DEMO STORE)
// ============================================================================
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_REVIEWS } from '../lib/mockData';
import type { Category, Product, Review, Order, OrderItem, ShippingAddress, CartItem } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'sora_pink_products',
  CATEGORIES: 'sora_pink_categories',
  REVIEWS: 'sora_pink_reviews',
  ORDERS: 'sora_pink_orders',
  WISHLIST: 'sora_pink_wishlist',
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

// Initialize Mock store in browser if not already there
if (typeof window !== 'undefined') {
  // Categories sync
  const existingCats = getStoredData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const catMap = new Map<string, Category>();
  existingCats.forEach((c) => catMap.set(c.id, c));
  INITIAL_CATEGORIES.forEach((ic) => catMap.set(ic.id, ic));
  setStoredData(STORAGE_KEYS.CATEGORIES, Array.from(catMap.values()));

  const existingProds = getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  // Ensure all initial products are up to date and any new products are cleanly integrated
  const prodMap = new Map<string, Product>();
  existingProds.forEach((p) => prodMap.set(p.id, p));
  INITIAL_PRODUCTS.forEach((ip) => prodMap.set(ip.id, ip));
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
      if (error) throw error;
      if (data && data.length > 0) return data as Category[];
    } catch (err) {
      console.warn('Supabase fetchCategories error, falling back to local:', err);
    }
  }
  return getStoredData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
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

      if (error) throw error;
      if (data && data.length > 0) return data as Product[];
    } catch (err) {
      console.warn('Supabase fetchProducts error, falling back to local:', err);
    }
  }
  return getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
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

export const submitProductReview = async (
  productId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  rating: number,
  comment: string
): Promise<Review> => {
  const newReview: Review = {
    id: 'rev-' + Date.now(),
    product_id: productId,
    user_id: userId,
    user_name: userName,
    user_avatar: userAvatar,
    rating,
    comment,
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
  paymentMethod: Order['payment_method']
): Promise<Order> => {
  const orderId = 'SP-' + Date.now().toString().slice(-8);

  const orderItems: OrderItem[] = items.map((item) => ({
    id: 'item-' + Math.random().toString(36).substring(2, 9),
    order_id: orderId,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.product.discount_price ?? item.product.price,
    product: item.product,
  }));

  const orderData: Order = {
    id: orderId,
    user_id: userId || 'guest-user',
    total_amount: totalAmount,
    discount_amount: discountAmount,
    shipping_fee: shippingFee,
    shipping_address: shippingAddress,
    payment_method: paymentMethod,
    payment_status: paymentMethod === 'promptpay' ? 'paid' : 'pending',
    order_status: 'processing',
    tracking_number: null,
    created_at: new Date().toISOString(),
    items: orderItems,
  };

  // If Supabase is connected, insert order & order_items
  if (isSupabaseConfigured() && userId && !userId.startsWith('guest-')) {
    try {
      const { data: dbOrder, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          discount_amount: discountAmount,
          shipping_fee: shippingFee,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          payment_status: orderData.payment_status,
          order_status: 'processing',
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

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
  const currentProducts = getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updatedProducts = currentProducts.map((p) => {
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

  return orderData;
};

export const fetchOrders = async (userId?: string): Promise<Order[]> => {
  if (isSupabaseConfigured() && userId && !userId.startsWith('guest-')) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((o: any) => ({
          ...o,
          items: o.order_items.map((oi: any) => ({
            id: oi.id,
            order_id: oi.order_id,
            product_id: oi.product_id,
            quantity: oi.quantity,
            price_at_purchase: oi.price_at_purchase,
            product: oi.products,
          })),
        }));
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
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        return data.map((o: any) => ({
          ...o,
          items: o.order_items.map((oi: any) => ({
            id: oi.id,
            order_id: oi.order_id,
            product_id: oi.product_id,
            quantity: oi.quantity,
            price_at_purchase: oi.price_at_purchase,
            product: oi.products,
          })),
        }));
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
  trackingNumber?: string
): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const updatePayload: any = { order_status: status };
      if (trackingNumber !== undefined) updatePayload.tracking_number = trackingNumber;
      await supabase.from('orders').update(updatePayload).eq('id', orderId);
    } catch (err) {
      console.warn('Supabase update order error:', err);
    }
  }

  const orders = getStoredData<Order[]>(STORAGE_KEYS.ORDERS, []);
  const updatedOrders = orders.map((o) => {
    if (o.id === orderId) {
      return {
        ...o,
        order_status: status,
        tracking_number: trackingNumber !== undefined ? trackingNumber : o.tracking_number,
        updated_at: new Date().toISOString(),
      };
    }
    return o;
  });
  setStoredData(STORAGE_KEYS.ORDERS, updatedOrders);
  return true;
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
    targetProduct = {
      id: 'p-' + Date.now(),
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
