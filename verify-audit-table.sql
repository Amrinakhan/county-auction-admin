-- Verification and Fix Script for audit_log table
-- Run this in phpMyAdmin to check and fix the table

USE county_admin;

-- Step 1: Check if table exists
SELECT 'Checking if audit_log table exists...' AS status;
SHOW TABLES LIKE 'audit_log';

-- Step 2: If table exists, check its structure
SELECT 'Current table structure:' AS status;
DESCRIBE audit_log;

-- Step 3: Drop and recreate with correct structure
DROP TABLE IF EXISTS audit_log;

CREATE TABLE audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(255) NOT NULL,
  entity_id INT NULL,
  performed_by VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  details TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at),
  INDEX idx_entity (entity),
  INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 4: Verify the new structure
SELECT 'New table structure:' AS status;
DESCRIBE audit_log;

-- Step 5: Insert a test record
INSERT INTO audit_log (action, entity, entity_id, performed_by, role, details)
VALUES ('TEST', 'TestEntity', 1, 'Test User', 'admin', 'Test record to verify table works');

-- Step 6: Verify the test record
SELECT 'Test record inserted:' AS status;
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 1;

-- Step 7: Show all records
SELECT 'All audit logs:' AS status;
SELECT * FROM audit_log ORDER BY created_at DESC;

