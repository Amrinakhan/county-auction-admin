-- SIMPLE VERSION: Run this ENTIRE block at once in phpMyAdmin
-- This handles foreign keys automatically

USE county_admin;

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop the properties table
DROP TABLE IF EXISTS properties;

-- Create new properties table
CREATE TABLE properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  county VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'available',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at),
  INDEX idx_county (county),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clean up bids table (set property_id to NULL)
UPDATE bids SET property_id = NULL WHERE property_id IS NOT NULL;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify
DESCRIBE properties;

-- Test insert
INSERT INTO properties (name, location, county, price, status)
VALUES ('Test Property', '123 Main St', 'Test County', 100000.00, 'available');

SELECT * FROM properties;

