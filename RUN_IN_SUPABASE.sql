-- ========================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- ========================================
-- This adds "All Sites Checked" functionality
-- ========================================

-- Step 1: Add the all_sites_checked column
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS all_sites_checked BOOLEAN DEFAULT FALSE;

-- Step 2: Add the updated_at column  
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 3: Create function to auto-update timestamp
CREATE OR REPLACE FUNCTION update_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger
DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_portfolio_updated_at();

-- Step 5: Verify it worked
SELECT 
    portfolio_id,
    name,
    all_sites_checked,
    updated_at
FROM portfolios
ORDER BY name
LIMIT 5;

-- Success message
SELECT '✅ Migration complete! All Sites Checked field added!' AS status;
