-- Complete reset of properties table
-- Run this in phpMyAdmin to reset the properties table with the new structure
-- This script handles foreign key constraints properly

USE county_admin;

-- Step 1: Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Drop the old properties table (WARNING: This will delete all existing property data!)
DROP TABLE IF EXISTS properties;

-- Step 3: Create the new properties table with clean structure
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

-- Step 4: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 5: Update bids table to set property_id to NULL (since old properties are gone)
-- This prevents foreign key constraint issues
UPDATE bids SET property_id = NULL WHERE property_id IS NOT NULL;

-- Step 6: Verify the new structure
DESCRIBE properties;

-- Step 7: Insert a test property to verify it works
INSERT INTO properties (name, location, county, price, status)
VALUES ('Test Property', '123 Main St', 'Test County', 100000.00, 'available');

-- Step 8: Verify the test data
SELECT * FROM properties;

