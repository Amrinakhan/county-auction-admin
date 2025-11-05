-- Add bidder_id column to properties table
-- Run this SQL in phpMyAdmin

USE county_admin;

-- Step 1: Add bidder_id column (nullable)
ALTER TABLE properties 
ADD COLUMN bidder_id INT NULL AFTER status;

-- Step 2: Add foreign key constraint
ALTER TABLE properties 
ADD CONSTRAINT properties_bidder_fk 
FOREIGN KEY (bidder_id) 
REFERENCES users(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Step 3: Verify the structure
DESCRIBE properties;

-- Step 4: Show the constraint
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'properties' 
  AND TABLE_SCHEMA = 'county_admin'
  AND REFERENCED_TABLE_NAME = 'users';

