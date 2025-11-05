-- Complete fix for properties table
-- Run this in phpMyAdmin to fix all column issues

USE county_admin;

-- Step 1: Check current table structure
DESCRIBE properties;

-- Step 2: Show all columns
SHOW COLUMNS FROM properties;

-- Step 3: If 'county' column exists (not county_id), we need to handle it
-- Option A: Drop the 'county' column if it's redundant (backup first!)
-- ALTER TABLE properties DROP COLUMN IF EXISTS county;

-- Option B: Make 'county' nullable if it exists
ALTER TABLE properties 
MODIFY COLUMN county VARCHAR(255) NULL DEFAULT NULL;

-- Step 4: Ensure county_id is nullable
ALTER TABLE properties 
MODIFY COLUMN county_id INT NULL;

-- Step 5: Verify the structure
DESCRIBE properties;

-- Step 6: Show the CREATE TABLE statement to see all constraints
SHOW CREATE TABLE properties;

