-- Fix bids table: Make property_id NOT NULL
-- Run ALL of this SQL at ONCE in phpMyAdmin

USE county_admin;

-- Step 1: Find the foreign key constraint name
SET @constraint_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_NAME = 'properties' 
      AND TABLE_SCHEMA = 'county_admin'
      AND TABLE_NAME = 'bids'
    LIMIT 1
);

-- Step 2: Drop the foreign key constraint
SET @sql = CONCAT('ALTER TABLE bids DROP FOREIGN KEY ', IFNULL(@constraint_name, 'bids_property_fk'));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Update any NULL property_ids to a valid property ID
-- First, let's check if there are any NULL values
UPDATE bids 
SET property_id = (SELECT id FROM properties LIMIT 1) 
WHERE property_id IS NULL;

-- Step 4: Now make property_id NOT NULL
ALTER TABLE bids MODIFY COLUMN property_id INT NOT NULL;

-- Step 5: Recreate the foreign key constraint with CASCADE (not SET NULL)
ALTER TABLE bids 
ADD CONSTRAINT bids_property_fk 
FOREIGN KEY (property_id) 
REFERENCES properties(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 6: Verify the structure
DESCRIBE bids;

-- Step 7: Show the constraint
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'bids' 
  AND TABLE_SCHEMA = 'county_admin'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

