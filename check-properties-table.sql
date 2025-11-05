-- Check properties table structure
-- Run this first to see what constraints exist

USE county_admin;

-- Show table structure
DESCRIBE properties;

-- Show table creation SQL (shows all constraints)
SHOW CREATE TABLE properties;

-- Check foreign keys
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'county_admin'
    AND TABLE_NAME = 'properties'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

