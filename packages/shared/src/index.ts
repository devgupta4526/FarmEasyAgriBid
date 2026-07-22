// Shared types between frontend and backend

export type UserRole = 'farmer' | 'buyer' | 'logistics' | 'admin' | 'super_admin';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned' | 'deactivated';
export type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';
export type ProductStatus = 'draft' | 'active' | 'sold' | 'expired' | 'suspended' | 'archived';
export type ListingType = 'auction' | 'instant_buy' | 'both';
export type AuctionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled' | 'sold';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'refunded' | 'disputed';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';
export type QualityGrade = 'A' | 'B' | 'C' | 'premium' | 'export';
export type LanguageCode = 'en' | 'hi' | 'mr' | 'gu' | 'kn' | 'ta' | 'te' | 'pa' | 'bn';

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  full_name: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  preferred_language?: LanguageCode;
  dark_mode?: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  referral_code?: string;
  xp_points: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  farmer_id: string;
  category_id: string;
  title: string;
  description?: string;
  slug?: string;
  listing_type: ListingType;
  status: ProductStatus;
  base_price?: number;
  buy_now_price?: number;
  quantity_available: number;
  quantity_unit: string;
  quality_grade?: QualityGrade;
  is_organic: boolean;
  harvest_date?: string;
  shelf_life_days?: number;
  images: string[];
  thumbnail_url?: string;
  location_text?: string;
  latitude?: number;
  longitude?: number;
  state?: string;
  district?: string;
  tags?: string[];
  views_count: number;
  likes_count: number;
  created_at: string;
}

export interface Auction {
  id: string;
  product_id: string;
  farmer_id: string;
  status: AuctionStatus;
  start_price: number;
  reserve_price?: number;
  buy_now_price?: number;
  bid_increment: number;
  current_bid?: number;
  current_winner_id?: string;
  total_bids: number;
  starts_at: string;
  ends_at: string;
  anti_snipe_enabled: boolean;
  winner_id?: string;
  winning_bid?: number;
  sold_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  farmer_id: string;
  product_id: string;
  auction_id?: string;
  quantity: number;
  quantity_unit: string;
  unit_price: number;
  subtotal: number;
  platform_fee: number;
  delivery_fee: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
