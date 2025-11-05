-- Simple Fix: Just add the foreign key constraint if it doesn't exist
-- Run this SQL in phpMyAdmin

USE county_admin;

-- Step 1: Check if foreign key constraint exists
SELECT 
    CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'properties' 
  AND TABLE_SCHEMA = 'county_admin'
  AND COLUMN_NAME = 'bidder_id'
  AND REFERENCED_TABLE_NAME = 'users';

-- Step 2: If the above query returns nothing, then add the constraint:
-- (Only run this if the constraint doesn't exist)
ALTER TABLE properties 
ADD CONSTRAINT properties_bidder_fk 
FOREIGN KEY (bidder_id) 
REFERENCES users(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Step 3: Verify
DESCRIBE properties;

