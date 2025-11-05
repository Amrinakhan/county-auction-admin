-- Check bids table structure
-- Run this in phpMyAdmin to verify the table structure

USE county_admin;

-- Check current structure
DESCRIBE bids;

-- Check if bid_amount column exists
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'county_admin'
  AND TABLE_NAME = 'bids';

-- Check foreign key constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'bids' 
  AND TABLE_SCHEMA = 'county_admin';

-- Show sample data
SELECT * FROM bids LIMIT 5;

