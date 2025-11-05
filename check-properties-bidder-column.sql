-- Check if bidder_id column exists and its structure
-- Run this in phpMyAdmin

USE county_admin;

-- Check the current structure
DESCRIBE properties;

-- Check if bidder_id column exists
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_KEY
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'county_admin'
  AND TABLE_NAME = 'properties'
  AND COLUMN_NAME = 'bidder_id';

-- Check foreign key constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'properties' 
  AND TABLE_SCHEMA = 'county_admin'
  AND COLUMN_NAME = 'bidder_id';

