-- Fix properties table - Remove 'county' column if it exists (should only have county_id)
-- Run this in phpMyAdmin

USE county_admin;

-- Check current table structure
DESCRIBE properties;

-- Check if 'county' column exists (it shouldn't - only county_id should exist)
-- If 'county' column exists, drop it (it's a duplicate/redundant column)
-- But first, let's see what columns exist:
SHOW COLUMNS FROM properties;

-- If there's a 'county' column that's NOT NULL, we need to either:
-- 1. Drop it (if it's redundant)
-- 2. Or make it nullable

-- Option 1: Drop the county column if it exists (be careful - backup first!)
-- ALTER TABLE properties DROP COLUMN IF EXISTS county;

-- Option 2: Make county nullable if it exists
-- ALTER TABLE properties MODIFY COLUMN county VARCHAR(255) NULL;

-- Ensure county_id is nullable
ALTER TABLE properties MODIFY COLUMN county_id INT NULL;

-- Verify the structure
DESCRIBE properties;

