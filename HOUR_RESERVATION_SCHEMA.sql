-- Create table for tracking hour reservations
CREATE TABLE IF NOT EXISTS hour_reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id INTEGER NOT NULL,
  issue_hour INTEGER NOT NULL,
  monitored_by TEXT NOT NULL,
  session_id TEXT NOT NULL,
  reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id),
  UNIQUE(portfolio_id, issue_hour, monitored_by)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reservations_lookup 
ON hour_reservations(portfolio_id, issue_hour, monitored_by);

-- Create index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_reservations_expires 
ON hour_reservations(expires_at);
