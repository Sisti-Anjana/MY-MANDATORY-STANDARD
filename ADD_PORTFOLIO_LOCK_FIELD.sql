-- Add locking fields to portfolios table
-- This allows tracking which portfolios are locked and by whom

-- Add is_locked column (default FALSE)
ALTER TABLE portfolios ADD COLUMN is_locked BOOLEAN DEFAULT 0;

-- Add locked_by column to track who locked it
ALTER TABLE portfolios ADD COLUMN locked_by TEXT;

-- Add locked_at column to track when it was locked
ALTER TABLE portfolios ADD COLUMN locked_at DATETIME;

-- Create index for faster queries on locked portfolios
CREATE INDEX IF NOT EXISTS idx_portfolios_is_locked ON portfolios(is_locked);
