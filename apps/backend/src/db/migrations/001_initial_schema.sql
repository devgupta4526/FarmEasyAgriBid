-- ============================================================
-- AgriBid Database Schema
-- Migration: 001_initial_schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('farmer', 'buyer', 'logistics', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'banned', 'deactivated');
CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'approved', 'rejected');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'sold', 'expired', 'suspended', 'archived');
CREATE TYPE listing_type AS ENUM ('auction', 'instant_buy', 'both');
CREATE TYPE auction_status AS ENUM ('scheduled', 'live', 'ended', 'cancelled', 'sold');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'refunded', 'disputed');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed');
CREATE TYPE delivery_type AS ENUM ('pickup', 'delivery', 'both');
CREATE TYPE transaction_type AS ENUM ('credit', 'debit', 'escrow_hold', 'escrow_release', 'refund', 'reward', 'fee', 'withdrawal');
CREATE TYPE notification_type AS ENUM ('bid', 'auction_win', 'order', 'payment', 'kyc', 'system', 'chat', 'price_alert', 'stock_alert', 'review');
CREATE TYPE complaint_status AS ENUM ('open', 'in_review', 'resolved', 'closed', 'escalated');
CREATE TYPE vehicle_type AS ENUM ('bike', 'auto', 'mini_truck', 'truck', 'refrigerated_truck');
CREATE TYPE quality_grade AS ENUM ('A', 'B', 'C', 'premium', 'export');
CREATE TYPE bid_status AS ENUM ('active', 'outbid', 'won', 'lost', 'cancelled');
CREATE TYPE language_code AS ENUM ('en', 'hi', 'mr', 'gu', 'kn', 'ta', 'te', 'pa', 'bn');

-- ============================================================
-- CORE USER TABLES
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    role user_role NOT NULL DEFAULT 'buyer',
    status user_status NOT NULL DEFAULT 'pending',
    full_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    preferred_language language_code DEFAULT 'en',
    dark_mode BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    referral_code VARCHAR(20) UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
    referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
    xp_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    fcm_token TEXT,
    supabase_uid VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE farmer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(255),
    farm_size_acres DECIMAL(10,2),
    farm_location_text TEXT,
    farm_latitude DECIMAL(10,8),
    farm_longitude DECIMAL(11,8),
    farm_state VARCHAR(100),
    farm_district VARCHAR(100),
    farm_pincode VARCHAR(10),
    farm_photos TEXT[],
    crops_grown TEXT[],
    years_of_experience INTEGER,
    organic_certified BOOLEAN DEFAULT FALSE,
    organic_certificate_url TEXT,
    fpo_member BOOLEAN DEFAULT FALSE,
    fpo_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),
    bank_name VARCHAR(100),
    bank_account_holder VARCHAR(255),
    upi_id VARCHAR(100),
    kyc_status kyc_status DEFAULT 'not_submitted',
    kyc_submitted_at TIMESTAMPTZ,
    kyc_reviewed_at TIMESTAMPTZ,
    kyc_reviewed_by UUID REFERENCES users(id),
    kyc_rejection_reason TEXT,
    aadhar_number VARCHAR(12),
    pan_number VARCHAR(10),
    aadhar_doc_url TEXT,
    pan_doc_url TEXT,
    land_doc_url TEXT,
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE buyer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    gst_number VARCHAR(20),
    business_type VARCHAR(100),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    kyc_status kyc_status DEFAULT 'not_submitted',
    gst_doc_url TEXT,
    total_purchases INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE logistics_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type vehicle_type NOT NULL,
    vehicle_number VARCHAR(20),
    vehicle_capacity_kg DECIMAL(10,2),
    vehicle_photos TEXT[],
    license_number VARCHAR(50),
    license_doc_url TEXT,
    insurance_doc_url TEXT,
    current_latitude DECIMAL(10,8),
    current_longitude DECIMAL(11,8),
    is_available BOOLEAN DEFAULT TRUE,
    base_location_text TEXT,
    total_deliveries INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_earnings DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES & PRODUCTS
-- ============================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(300) UNIQUE,
    listing_type listing_type NOT NULL DEFAULT 'both',
    status product_status NOT NULL DEFAULT 'draft',
    
    -- Pricing
    base_price DECIMAL(12,2),
    buy_now_price DECIMAL(12,2),
    min_order_qty DECIMAL(10,2) DEFAULT 1,
    max_order_qty DECIMAL(10,2),
    
    -- Quantity
    quantity_available DECIMAL(10,2) NOT NULL,
    quantity_unit VARCHAR(20) DEFAULT 'kg',
    quantity_reserved DECIMAL(10,2) DEFAULT 0,
    quantity_sold DECIMAL(10,2) DEFAULT 0,
    
    -- Quality
    quality_grade quality_grade,
    is_organic BOOLEAN DEFAULT FALSE,
    organic_cert_url TEXT,
    harvest_date DATE,
    shelf_life_days INTEGER,
    moisture_content DECIMAL(5,2),
    
    -- Media
    images TEXT[],
    video_url TEXT,
    thumbnail_url TEXT,
    
    -- Location
    location_text TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    state VARCHAR(100),
    district VARCHAR(100),
    pincode VARCHAR(10),
    
    -- Delivery
    delivery_type delivery_type DEFAULT 'both',
    delivery_radius_km INTEGER,
    
    -- Packaging
    packaging_info TEXT,
    weight_per_unit DECIMAL(10,3),
    
    -- Meta
    tags TEXT[],
    certifications TEXT[],
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Flags
    is_bulk BOOLEAN DEFAULT FALSE,
    is_wholesale BOOLEAN DEFAULT FALSE,
    is_export_quality BOOLEAN DEFAULT FALSE,
    is_seasonal BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE product_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, product_id)
);

-- ============================================================
-- AUCTIONS
-- ============================================================

CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES users(id),
    status auction_status NOT NULL DEFAULT 'scheduled',
    
    start_price DECIMAL(12,2) NOT NULL,
    reserve_price DECIMAL(12,2),
    buy_now_price DECIMAL(12,2),
    bid_increment DECIMAL(10,2) NOT NULL DEFAULT 10,
    
    current_bid DECIMAL(12,2),
    current_winner_id UUID REFERENCES users(id),
    total_bids INTEGER DEFAULT 0,
    
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    extended_count INTEGER DEFAULT 0,
    
    anti_snipe_enabled BOOLEAN DEFAULT TRUE,
    anti_snipe_threshold_minutes INTEGER DEFAULT 1,
    anti_snipe_extension_minutes INTEGER DEFAULT 2,
    
    auto_bid_enabled BOOLEAN DEFAULT TRUE,
    
    winner_id UUID REFERENCES users(id),
    winning_bid DECIMAL(12,2),
    sold_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(12,2) NOT NULL,
    status bid_status NOT NULL DEFAULT 'active',
    is_auto_bid BOOLEAN DEFAULT FALSE,
    auto_bid_max DECIMAL(12,2),
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auto_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES users(id),
    max_amount DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(auction_id, bidder_id)
);

CREATE TABLE reverse_auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id),
    category_id UUID REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) NOT NULL,
    quantity_unit VARCHAR(20) DEFAULT 'kg',
    target_price DECIMAL(12,2),
    max_budget DECIMAL(12,2),
    location_text TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    radius_km INTEGER DEFAULT 100,
    quality_required quality_grade,
    organic_required BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'open',
    accepted_offer_id UUID,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reverse_auction_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reverse_auction_id UUID NOT NULL REFERENCES reverse_auctions(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES users(id),
    price_per_unit DECIMAL(12,2) NOT NULL,
    message TEXT,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) UNIQUE DEFAULT 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || substring(uuid_generate_v4()::text from 1 for 8),
    buyer_id UUID NOT NULL REFERENCES users(id),
    farmer_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    auction_id UUID REFERENCES auctions(id),
    
    quantity DECIMAL(10,2) NOT NULL,
    quantity_unit VARCHAR(20) DEFAULT 'kg',
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    
    status order_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    
    delivery_type delivery_type NOT NULL DEFAULT 'delivery',
    delivery_address JSONB,
    pickup_address JSONB,
    
    coupon_code VARCHAR(50),
    coupon_discount DECIMAL(10,2) DEFAULT 0,
    
    notes TEXT,
    farmer_notes TEXT,
    
    confirmed_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    message TEXT,
    location_text TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LOGISTICS / DELIVERIES
-- ============================================================

CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id),
    driver_id UUID REFERENCES users(id),
    
    pickup_address JSONB NOT NULL,
    pickup_latitude DECIMAL(10,8),
    pickup_longitude DECIMAL(11,8),
    
    delivery_address JSONB NOT NULL,
    delivery_latitude DECIMAL(10,8),
    delivery_longitude DECIMAL(11,8),
    
    estimated_pickup_at TIMESTAMPTZ,
    actual_pickup_at TIMESTAMPTZ,
    estimated_delivery_at TIMESTAMPTZ,
    actual_delivery_at TIMESTAMPTZ,
    
    status VARCHAR(30) DEFAULT 'pending',
    distance_km DECIMAL(8,2),
    delivery_fee DECIMAL(10,2),
    
    proof_of_delivery_url TEXT,
    driver_notes TEXT,
    
    driver_latitude DECIMAL(10,8),
    driver_longitude DECIMAL(11,8),
    last_location_update TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WALLET & PAYMENTS
-- ============================================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    escrow_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    reward_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_credited DECIMAL(15,2) DEFAULT 0,
    total_debited DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    type transaction_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHAT
-- ============================================================

CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_1 UUID NOT NULL REFERENCES users(id),
    participant_2 UUID NOT NULL REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    order_id UUID REFERENCES orders(id),
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_1, participant_2)
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT,
    media_url TEXT,
    media_type VARCHAR(20),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    content TEXT,
    photos TEXT[],
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WISHLIST & ALERTS
-- ============================================================

CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price_alert_threshold DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    query JSONB NOT NULL,
    alert_enabled BOOLEAN DEFAULT FALSE,
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUPONS & REFERRALS
-- ============================================================

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percent',
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(12,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    user_limit INTEGER DEFAULT 1,
    applicable_roles user_role[],
    applicable_categories UUID[],
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    discount_given DECIMAL(10,2),
    used_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(coupon_id, user_id, order_id)
);

CREATE TABLE referral_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_id UUID NOT NULL REFERENCES users(id),
    reward_amount DECIMAL(10,2),
    reward_type VARCHAR(20) DEFAULT 'wallet',
    triggered_event VARCHAR(50),
    is_credited BOOLEAN DEFAULT FALSE,
    credited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GAMIFICATION
-- ============================================================

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    condition_type VARCHAR(50),
    condition_value INTEGER,
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_badges (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- ============================================================
-- INVENTORY
-- ============================================================

CREATE TABLE inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    quantity_change DECIMAL(10,2) NOT NULL,
    quantity_before DECIMAL(10,2),
    quantity_after DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMPLAINTS
-- ============================================================

CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complainant_id UUID NOT NULL REFERENCES users(id),
    against_user_id UUID REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    type VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    evidence_urls TEXT[],
    status complaint_status DEFAULT 'open',
    assigned_to UUID REFERENCES users(id),
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CMS / ADMIN
-- ============================================================

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_roles user_role[],
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI / ANALYTICS
-- ============================================================

CREATE TABLE ai_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    feature VARCHAR(50) NOT NULL,
    input_data JSONB,
    response_data JSONB,
    tokens_used INTEGER,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    price DECIMAL(12,2) NOT NULL,
    source VARCHAR(50),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_supabase_uid ON users(supabase_uid);

-- Products
CREATE INDEX idx_products_farmer_id ON products(farmer_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_listing_type ON products(listing_type);
CREATE INDEX idx_products_location ON products USING gist(point(longitude, latitude));
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_title_trgm ON products USING gin(title gin_trgm_ops);

-- Auctions
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_ends_at ON auctions(ends_at);
CREATE INDEX idx_auctions_farmer_id ON auctions(farmer_id);

-- Bids
CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX idx_bids_created_at ON bids(created_at DESC);

-- Orders
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Chat
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Audit Logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users','farmer_profiles','buyer_profiles','logistics_profiles',
        'products','auctions','orders','deliveries','wallets','reviews','complaints','auto_bids'
    ] LOOP
        EXECUTE format('
            CREATE TRIGGER trg_%s_updated_at
            BEFORE UPDATE ON %s
            FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
    END LOOP;
END;
$$;

-- Create wallet on user creation
CREATE OR REPLACE FUNCTION create_wallet_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_create_wallet
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_wallet_for_user();

-- Update product quantity on order
CREATE OR REPLACE FUNCTION reserve_product_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
        UPDATE products
        SET quantity_reserved = quantity_reserved + NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE products
        SET quantity_reserved = quantity_reserved - NEW.quantity,
            quantity_sold = quantity_sold + NEW.quantity,
            quantity_available = quantity_available - NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_reserve_quantity
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION reserve_product_quantity();

-- Update farmer total sales stats
CREATE OR REPLACE FUNCTION update_farmer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE farmer_profiles
        SET total_sales = total_sales + 1,
            total_revenue = total_revenue + NEW.total_amount
        WHERE user_id = NEW.farmer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_farmer_stats
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_farmer_stats();

-- Update product likes count
CREATE OR REPLACE FUNCTION update_product_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE products SET likes_count = likes_count + 1 WHERE id = NEW.product_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE products SET likes_count = likes_count - 1 WHERE id = OLD.product_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_product_likes_count
AFTER INSERT OR DELETE ON product_likes
FOR EACH ROW EXECUTE FUNCTION update_product_likes_count();
