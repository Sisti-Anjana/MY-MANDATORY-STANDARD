-- Run this in your SQLite database to add the hour reservation functionality
-- This enables the feature where users can "lock" a portfolio/hour/monitor combination
-- while they're logging an issue, preventing other users from selecting the same combination

-- Step 1: Create the hour_reservations table
CREATE TABLE IF NOT EXISTS hour_reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id INTEGER NOT NULL,
  issue_hour INTEGER NOT NULL,
  monitored_by TEXT NOT NULL,
  session_id TEXT NOT NULL,
  reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  UNIQUE(portfolio_id, issue_hour, monitored_by)
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reservations_lookup 
ON hour_reservations(portfolio_id, issue_hour, monitored_by);

CREATE INDEX IF NOT EXISTS idx_reservations_expires 
ON hour_reservations(expires_at);

CREATE INDEX IF NOT EXISTS idx_reservations_session 
ON hour_reservations(session_id);

-- Step 3: Verify the table was created
SELECT name FROM sqlite_master WHERE type='table' AND name='hour_reservations';

-- Step 4: Test query (optional)
-- This should return 0 rows initially
SELECT * FROM hour_reservations;

-- Notes:
-- 1. Reservations automatically expire after 1 hour
-- 2. The server cleans up expired reservations every minute
-- 3. Each user (session) can only have one reservation per portfolio/hour/monitor combination
-- 4. When a user selects portfolio + hour + monitored_by, a reservation is created
-- 5. Other users will see an error if they try to select the same combination
