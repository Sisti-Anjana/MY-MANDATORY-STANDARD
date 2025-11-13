-- ========================================
-- ADD ALL SITES CHECKED FIELD - SQLite Version
-- ========================================
-- This adds a new field to track if all sites 
-- in a portfolio have been checked
-- ========================================

-- Add the all_sites_checked field to portfolios table
-- Default is 0 (FALSE/No) for all existing portfolios
-- SQLite uses INTEGER for BOOLEAN (0 = false, 1 = true)
ALTER TABLE portfolios 
ADD COLUMN all_sites_checked INTEGER DEFAULT 0;

-- Add an updated_at timestamp to track when status changes
ALTER TABLE portfolios 
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Note: SQLite doesn't support triggers in ALTER TABLE statements
-- Create trigger separately for auto-updating updated_at on portfolios
DROP TRIGGER IF EXISTS update_portfolios_updated_at;
CREATE TRIGGER update_portfolios_updated_at
    AFTER UPDATE ON portfolios
    FOR EACH ROW
BEGIN
    UPDATE portfolios 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- Verification query
SELECT 
    id,
    name,
    all_sites_checked,
    updated_at
FROM portfolios
ORDER BY name
LIMIT 5;

-- Success message
SELECT '✅ All Sites Checked field added successfully to SQLite database!' AS status;
