-- Fix: Make item_name nullable or drop it (since Prisma schema doesn't use it)
-- Run ALL of this SQL at ONCE in phpMyAdmin

USE county_admin;

-- Option 1: Make item_name nullable (recommended - keeps existing data)
ALTER TABLE bids MODIFY COLUMN item_name VARCHAR(255) NULL;

-- OR Option 2: Drop item_name column entirely (if you don't need it)
-- Uncomment the line below if you want to remove it completely:
-- ALTER TABLE bids DROP COLUMN item_name;

-- Verify the structure
DESCRIBE bids;

