-- Simple Migration SQL: Update bids table for new Bid model
-- Run ALL of this SQL at ONCE in phpMyAdmin

USE county_admin;

-- Step 1: Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Add amount column if it doesn't exist
ALTER TABLE bids ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2);

-- Step 3: Copy data from bid_amount to amount if amount is NULL
UPDATE bids SET amount = bid_amount WHERE amount IS NULL AND bid_amount IS NOT NULL;

-- Step 4: Make property_id NOT NULL (if it's nullable)
ALTER TABLE bids MODIFY COLUMN property_id INT NOT NULL;

-- Step 5: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 6: Recreate foreign key constraint if needed
-- First drop existing constraint if it exists
SET @constraint_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_NAME = 'properties' 
      AND TABLE_SCHEMA = 'county_admin'
      AND TABLE_NAME = 'bids'
    LIMIT 1
);

SET @sql = CONCAT('ALTER TABLE bids DROP FOREIGN KEY ', IFNULL(@constraint_name, 'bids_property_fk'));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Recreate constraint
ALTER TABLE bids 
ADD CONSTRAINT bids_property_fk 
FOREIGN KEY (property_id) 
REFERENCES properties(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 7: Verify the structure
DESCRIBE bids;

-- Note: We keep bid_amount and item_name columns for backward compatibility
-- The Prisma schema uses @map to map amount -> bid_amount, so it will work

