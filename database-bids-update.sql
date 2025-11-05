-- Migration SQL: Update bids table structure for new Bid model
-- Run this in phpMyAdmin to update your database

USE county_admin;

-- Step 1: Check current structure
DESCRIBE bids;

-- Step 2: Drop foreign key constraint if it exists
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

-- Step 3: Make property_id NOT NULL (required)
ALTER TABLE bids MODIFY COLUMN property_id INT NOT NULL;

-- Step 4: Rename bid_amount to amount (add new column, copy data, drop old)
ALTER TABLE bids ADD COLUMN amount DECIMAL(10, 2) AFTER property_id;
UPDATE bids SET amount = bid_amount WHERE bid_amount IS NOT NULL;
ALTER TABLE bids DROP COLUMN bid_amount;

-- Step 5: Drop item_name column (no longer needed)
ALTER TABLE bids DROP COLUMN IF EXISTS item_name;

-- Step 6: Recreate foreign key constraint
ALTER TABLE bids 
ADD CONSTRAINT bids_property_fk 
FOREIGN KEY (property_id) 
REFERENCES properties(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 7: Verify the new structure
DESCRIBE bids;

-- Step 8: Update existing bids to have valid property_id if any are NULL
-- (This assumes you want to keep existing bids - adjust as needed)
UPDATE bids SET property_id = (SELECT id FROM properties LIMIT 1) WHERE property_id IS NULL;

