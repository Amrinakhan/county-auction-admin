-- Seed data for county_admin database
-- Run this after creating the tables

USE county_admin;

-- Insert sample users
INSERT INTO users (name, email, role, status) VALUES
('Admin User', 'admin@test.com', 'admin', 'active'),
('John Bidder', 'john@test.com', 'bidder', 'active'),
('Jane Bidder', 'jane@test.com', 'bidder', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert sample properties
INSERT INTO properties (title, county, status) VALUES
('County House', 'Hudson', 'open'),
('Farm Land', 'Essex', 'closed'),
('Commercial Building', 'Bergen', 'open')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Insert sample bids
-- Note: user_id should match the IDs from users table (adjust if needed)
INSERT INTO bids (user_id, item_name, bid_amount, status) VALUES
(1, 'County House', 50000.00, 'pending'),
(2, 'Farm Land', 75000.00, 'pending'),
(3, 'County House', 60000.00, 'pending')
ON DUPLICATE KEY UPDATE item_name=VALUES(item_name);

