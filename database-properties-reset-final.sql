-- FINAL VERSION: Drop foreign key first, then reset properties table
-- Run ALL of this SQL at ONCE in phpMyAdmin

USE county_admin;

-- Step 1: Drop the foreign key constraint first
ALTER TABLE bids DROP FOREIGN KEY bids_property_fk;

-- Step 2: Disable foreign key checks (extra safety)
SET FOREIGN_KEY_CHECKS = 0;

-- Step 3: Drop the old properties table
DROP TABLE IF EXISTS properties;

-- Step 4: Create the new properties table with clean structure
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

-- Step 5: Clean up bids table (set property_id to NULL)
UPDATE bids SET property_id = NULL WHERE property_id IS NOT NULL;

-- Step 6: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 7: Recreate the foreign key constraint (optional, but recommended for data integrity)
ALTER TABLE bids 
ADD CONSTRAINT bids_property_fk 
FOREIGN KEY (property_id) 
REFERENCES properties(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Step 8: Verify the new structure
DESCRIBE properties;

-- Step 9: Insert a test property to verify it works
INSERT INTO properties (name, location, county, price, status)
VALUES ('Test Property', '123 Main St', 'Test County', 100000.00, 'available');

-- Step 10: Verify the test data
SELECT * FROM properties;

