-- Create hour_reservations table in Supabase
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS hour_reservations (
  id SERIAL PRIMARY KEY,
  portfolio_id UUID NOT NULL,
  issue_hour INTEGER NOT NULL,
  monitored_by TEXT NOT NULL,
  session_id TEXT NOT NULL,
  reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
  UNIQUE(portfolio_id, issue_hour, monitored_by)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hour_reservations_expires 
ON hour_reservations(expires_at);

-- Create index for portfolio lookups
CREATE INDEX IF NOT EXISTS idx_hour_reservations_portfolio 
ON hour_reservations(portfolio_id, issue_hour);

-- Enable Row Level Security (RLS)
ALTER TABLE hour_reservations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read all reservations
CREATE POLICY "Anyone can view reservations" 
ON hour_reservations FOR SELECT 
USING (true);

-- Policy: Anyone can insert their own reservations
CREATE POLICY "Anyone can create reservations" 
ON hour_reservations FOR INSERT 
WITH CHECK (true);

-- Policy: Anyone can delete expired reservations
CREATE POLICY "Anyone can delete reservations" 
ON hour_reservations FOR DELETE 
USING (true);

-- Policy: Anyone can update reservations
CREATE POLICY "Anyone can update reservations" 
ON hour_reservations FOR UPDATE 
USING (true);
