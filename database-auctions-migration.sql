-- SQL Migration Script for Auctions + Bids System
-- Run this in phpMyAdmin or MySQL client

USE county_admin;

-- 1. Create auctions table
CREATE TABLE IF NOT EXISTS auctions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  status VARCHAR(20) DEFAULT 'UPCOMING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Add auction_id column to bids table (nullable, since existing bids might not have auctions)
ALTER TABLE bids ADD COLUMN IF NOT EXISTS auction_id INT NULL AFTER property_id;

-- 3. Add foreign key constraint for auction_id in bids table
-- Note: This will only work if the column doesn't already have a foreign key
-- If it does, you may need to drop and recreate it
SET @fk_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = 'county_admin' 
  AND TABLE_NAME = 'bids' 
  AND CONSTRAINT_NAME = 'bids_auction_fk'
);

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE bids ADD CONSTRAINT bids_auction_fk FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE SET NULL',
  'SELECT "Foreign key bids_auction_fk already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Create index on auction_id for better query performance
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);

-- 5. Verify tables exist
SELECT 'Auctions table created successfully' AS status;
SELECT COUNT(*) AS auctions_count FROM auctions;
SELECT COUNT(*) AS bids_with_auctions FROM bids WHERE auction_id IS NOT NULL;

