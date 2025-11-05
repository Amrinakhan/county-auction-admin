-- Migration script to add state and visible fields to counties table
-- Run this in phpMyAdmin or your MySQL client

USE county_admin;

-- Add state column (if it doesn't exist)
ALTER TABLE counties 
ADD COLUMN IF NOT EXISTS state VARCHAR(255) NULL AFTER name;

-- Add visible column (if it doesn't exist)
ALTER TABLE counties 
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE AFTER state;

-- Update existing records to have visible = true if NULL
UPDATE counties SET visible = TRUE WHERE visible IS NULL;

