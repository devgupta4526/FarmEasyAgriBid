-- ============================================================
-- Seed: Categories
-- ============================================================

INSERT INTO categories (id, name, slug, description, sort_order) VALUES
(uuid_generate_v4(), 'Vegetables', 'vegetables', 'Fresh farm vegetables', 1),
(uuid_generate_v4(), 'Fruits', 'fruits', 'Fresh seasonal fruits', 2),
(uuid_generate_v4(), 'Flowers', 'flowers', 'Fresh-cut flowers and ornamentals', 3),
(uuid_generate_v4(), 'Herbs', 'herbs', 'Culinary and medicinal herbs', 4),
(uuid_generate_v4(), 'Spices', 'spices', 'Whole and ground spices', 5),
(uuid_generate_v4(), 'Seeds', 'seeds', 'Planting and eating seeds', 6),
(uuid_generate_v4(), 'Grains', 'grains', 'Rice, wheat, maize and other grains', 7),
(uuid_generate_v4(), 'Pulses', 'pulses', 'Lentils, beans and peas', 8),
(uuid_generate_v4(), 'Organic', 'organic', 'Certified organic produce', 9),
(uuid_generate_v4(), 'Medicinal Plants', 'medicinal-plants', 'Ayurvedic and medicinal herbs', 10),
(uuid_generate_v4(), 'Dairy', 'dairy', 'Milk, ghee, paneer, curd', 11),
(uuid_generate_v4(), 'Honey', 'honey', 'Raw and organic honey', 12),
(uuid_generate_v4(), 'Mushrooms', 'mushrooms', 'Button, oyster, and exotic mushrooms', 13),
(uuid_generate_v4(), 'Processed Food', 'processed-food', 'Farm-processed food products', 14);

-- Seed badges
INSERT INTO badges (name, description, condition_type, condition_value, xp_reward) VALUES
('First Sale', 'Complete your first sale', 'sales_count', 1, 100),
('Power Seller', 'Complete 50 sales', 'sales_count', 50, 500),
('Top Rated', 'Maintain 4.5+ rating with 10+ reviews', 'rating', 45, 300),
('Organic Champion', 'Sell 100kg of certified organic produce', 'organic_sales_kg', 100, 400),
('Auction Winner', 'Win your first auction', 'auction_wins', 1, 150),
('Loyal Buyer', 'Place 10 orders', 'order_count', 10, 200),
('Community Leader', 'Refer 5 users', 'referral_count', 5, 250),
('Early Bird', 'Join in the first month', 'early_adopter', 1, 200);
