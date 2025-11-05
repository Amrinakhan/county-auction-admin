-- Complete reset of properties table with proper foreign key handling
-- Run ALL of this SQL at ONCE in phpMyAdmin (select all and execute)

USE county_admin;

-- Step 1: Find and drop the foreign key constraint from bids table
-- First, let's check what foreign keys exist
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME = 'properties' 
  AND TABLE_SCHEMA = 'county_admin';

-- Step 2: Drop the foreign key constraint (replace 'fk_bids_property' with the actual constraint name)
-- Common constraint names: fk_bids_property, bids_ibfk_2, etc.
-- If you see the constraint name from above, use it here:
SET @constraint_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_NAME = 'properties' 
      AND TABLE_SCHEMA = 'county_admin'
      AND TABLE_NAME = 'bids'
    LIMIT 1
);

SET @sql = CONCAT('ALTER TABLE bids DROP FOREIGN KEY ', @constraint_name);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Disable foreign key checks temporarily (extra safety)
SET FOREIGN_KEY_CHECKS = 0;

-- Step 4: Drop the old properties table
DROP TABLE IF EXISTS properties;

-- Step 5: Create the new properties table with clean structure
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

-- Step 6: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 7: Update bids table to set property_id to NULL (since old properties are gone)
UPDATE bids SET property_id = NULL WHERE property_id IS NOT NULL;

-- Step 8: Recreate the foreign key constraint (optional, but recommended)
-- This will allow bids to reference properties again
ALTER TABLE bids 
ADD CONSTRAINT fk_bids_property 
FOREIGN KEY (property_id) 
REFERENCES properties(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Step 9: Verify the new structure
DESCRIBE properties;

-- Step 10: Insert a test property to verify it works
INSERT INTO properties (name, location, county, price, status)
VALUES ('Test Property', '123 Main St', 'Test County', 100000.00, 'available');

-- Step 11: Verify the test data
SELECT * FROM properties;

