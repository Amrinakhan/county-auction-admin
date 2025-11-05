-- Migration SQL: Add new tables and columns without dropping existing data
-- Run this in phpMyAdmin to update your database
-- If you get errors about columns already existing, that's okay - just ignore them

USE county_admin;

-- Add new columns to users table
-- (Ignore error if columns already exist)
ALTER TABLE users 
  ADD COLUMN phone VARCHAR(255) AFTER email;

ALTER TABLE users 
  ADD COLUMN county VARCHAR(255) AFTER status;

-- Update users table role default
ALTER TABLE users MODIFY COLUMN role VARCHAR(50) DEFAULT 'bidder';

-- Create counties table
CREATE TABLE IF NOT EXISTS counties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add new columns to properties table
-- (Ignore error if columns already exist)
ALTER TABLE properties
  ADD COLUMN map_id VARCHAR(255) AFTER id;

ALTER TABLE properties
  ADD COLUMN sale_id VARCHAR(255) AFTER map_id;

ALTER TABLE properties
  ADD COLUMN owner VARCHAR(255) AFTER title;

ALTER TABLE properties
  ADD COLUMN address VARCHAR(255) AFTER owner;

ALTER TABLE properties
  ADD COLUMN county_id INT AFTER address;

ALTER TABLE properties
  ADD COLUMN surplus VARCHAR(255) AFTER county_id;

-- Add foreign key for county_id (only if it doesn't exist)
-- Run this separately if the first one fails
ALTER TABLE properties 
  ADD CONSTRAINT properties_county_fk 
  FOREIGN KEY (county_id) REFERENCES counties(id) ON DELETE SET NULL;

-- Add property_id to bids table
ALTER TABLE bids
  ADD COLUMN property_id INT AFTER user_id;

-- Add foreign key for property_id (only if it doesn't exist)
ALTER TABLE bids 
  ADD CONSTRAINT bids_property_fk 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
