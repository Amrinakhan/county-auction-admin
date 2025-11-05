-- Fix property table to allow NULL county_id
-- Run this in phpMyAdmin if you get "Null constraint violation on the fields: (county)"

USE county_admin;

-- Check current structure
DESCRIBE properties;

-- If county_id has NOT NULL constraint, remove it
ALTER TABLE properties 
MODIFY COLUMN county_id INT NULL;

-- Verify the change
DESCRIBE properties;

