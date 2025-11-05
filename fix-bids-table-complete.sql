-- Complete Fix: Update bids table to match Prisma schema
-- Run ALL of this SQL at ONCE in phpMyAdmin

USE county_admin;

-- Step 1: Check current structure
DESCRIBE bids;

-- Step 2: Find and drop foreign key constraints
SET @constraint_name_property = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_NAME = 'properties' 
      AND TABLE_SCHEMA = 'county_admin'
      AND TABLE_NAME = 'bids'
    LIMIT 1
);

SET @constraint_name_user = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_NAME = 'users' 
      AND TABLE_SCHEMA = 'county_admin'
      AND TABLE_NAME = 'bids'
    LIMIT 1
);

-- Drop property constraint if exists
SET @sql1 = CONCAT('ALTER TABLE bids DROP FOREIGN KEY ', IFNULL(@constraint_name_property, 'bids_property_fk'));
PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- Drop user constraint if exists
SET @sql2 = CONCAT('ALTER TABLE bids DROP FOREIGN KEY ', IFNULL(@constraint_name_user, 'bids_user_fk'));
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Step 3: Ensure bid_amount column exists (Prisma maps 'amount' to 'bid_amount')
ALTER TABLE bids 
ADD COLUMN IF NOT EXISTS bid_amount DECIMAL(10, 2) AFTER property_id;

-- Step 4: Copy data from amount to bid_amount if amount column exists
UPDATE bids 
SET bid_amount = amount 
WHERE bid_amount IS NULL AND amount IS NOT NULL;

-- Step 5: Make property_id NOT NULL
UPDATE bids 
SET property_id = (SELECT id FROM properties LIMIT 1) 
WHERE property_id IS NULL;

ALTER TABLE bids MODIFY COLUMN property_id INT NOT NULL;

-- Step 6: Make bid_amount NOT NULL (if it has NULL values, set to 0)
UPDATE bids SET bid_amount = 0 WHERE bid_amount IS NULL;
ALTER TABLE bids MODIFY COLUMN bid_amount DECIMAL(10, 2) NOT NULL;

-- Step 7: Recreate foreign key constraints
ALTER TABLE bids 
ADD CONSTRAINT bids_property_fk 
FOREIGN KEY (property_id) 
REFERENCES properties(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

ALTER TABLE bids 
ADD CONSTRAINT bids_user_fk 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 8: Verify the final structure
DESCRIBE bids;

-- Step 9: Show the constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'bids' 
  AND TABLE_SCHEMA = 'county_admin';

