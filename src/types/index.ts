// ============================================================================
// SORA PINK - DATA TYPES & INTERFACES
// ============================================================================

export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  created_at?: string;
}

export type SkinType = 'ผิวมัน' | 'ผิวแห้ง' | 'ผิวผสม' | 'ผิวแพ้ง่าย' | 'ทุกสภาพผิว';
export type SkinConcern = 'สิว' | 'ความกระจ่างใส' | 'ริ้วรอย' | 'ความชุ่มชื้น' | 'กระชับรูขุมขน';

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  ingredients: string;
  how_to_use: string;
  skin_types: string[];
  skin_concerns: string[];
  price: number;
  discount_price?: number | null;
  stock_quantity: number;
  images: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  rating?: number;
  review_count?: number;
}

export interface CartItem {
  id: string;
  user_id?: string;
  product_id: string;
  quantity: number;
  product: Product;
}

export type PaymentMethod = 'promptpay' | 'credit_card' | 'cod' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  province: string;
  postalCode: string;
  note?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id?: string;
  total_amount: number;
  discount_amount: number;
  shipping_fee: number;
  shipping_address: ShippingAddress;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  tracking_number?: string | null;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface PromoCode {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minSpend?: number;
  freeShipping?: boolean;
  description: string;
}

export interface FilterState {
  searchQuery: string;
  categoryId: string;
  priceRange: [number, number];
  skinTypes: string[];
  skinConcerns: string[];
  minRating: number;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}
