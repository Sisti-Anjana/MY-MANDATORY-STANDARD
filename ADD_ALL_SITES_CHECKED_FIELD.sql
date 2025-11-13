-- ========================================
-- ADD ALL SITES CHECKED FIELD TO PORTFOLIOS
-- ========================================
-- This adds a new field to track if all sites 
-- in a portfolio have been checked
-- ========================================

-- Add the all_sites_checked field to portfolios table
-- Default is FALSE (No) for all existing portfolios
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS all_sites_checked BOOLEAN DEFAULT FALSE;

-- Add an updated_at timestamp to track when status changes
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create a function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at on portfolios
DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_portfolio_updated_at();

-- Verification query
SELECT 
    portfolio_id,
    name,
    all_sites_checked,
    updated_at
FROM portfolios
ORDER BY name
LIMIT 5;

SELECT '✅ All Sites Checked field added successfully!' AS status;
