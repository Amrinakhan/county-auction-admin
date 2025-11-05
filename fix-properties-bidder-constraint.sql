-- Fix: Ensure bidder_id column and foreign key are set up correctly
-- Run ALL of this SQL at ONCE in phpMyAdmin

USE county_admin;

-- Step 1: Check if bidder_id column exists and its structure
DESCRIBE properties;

-- Step 2: Check if foreign key constraint exists
SET @constraint_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_NAME = 'properties' 
      AND TABLE_SCHEMA = 'county_admin'
      AND COLUMN_NAME = 'bidder_id'
      AND REFERENCED_TABLE_NAME = 'users'
    LIMIT 1
);

-- Step 3: If constraint doesn't exist, create it
SET @sql = CONCAT('ALTER TABLE properties ADD CONSTRAINT properties_bidder_fk FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE');
SET @sql_check = IFNULL(@constraint_name, 'NOT_EXISTS');

-- If constraint doesn't exist, add it
SET @sql_final = IF(@sql_check = 'NOT_EXISTS', @sql, 'SELECT "Constraint already exists" as message');
PREPARE stmt FROM @sql_final;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Verify the structure
DESCRIBE properties;

-- Step 5: Show all constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'properties' 
  AND TABLE_SCHEMA = 'county_admin'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

