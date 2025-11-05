-- Migration script to update audit_log table structure
-- Run this in phpMyAdmin or your MySQL client

USE county_admin;

-- Check if audit_log table exists and has old structure
-- If it exists with old columns, we'll recreate it (data will be lost)
-- If it doesn't exist, we'll create it fresh

DROP TABLE IF EXISTS audit_log;

-- Create the new audit_log table with the updated structure
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
  INDEX idx_entity (entity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

