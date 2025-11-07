-- ========================================
-- PORTFOLIO ISSUE TRACKER DATABASE SETUP
-- Supabase PostgreSQL Database Schema
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE 1: PORTFOLIOS
-- ========================================
CREATE TABLE IF NOT EXISTS portfolios (
    portfolio_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert 26 portfolios
INSERT INTO portfolios (name) VALUES
    ('Aurora'),
    ('BESS & Trimark'),
    ('Chint'),
    ('eG/GByte/PD/GPM'),
    ('Guarantee Sites'),
    ('Intermountain West'),
    ('KK'),
    ('Locus'),
    ('Main Portfolio'),
    ('Mid Atlantic 1'),
    ('Mid Atlantic 2'),
    ('Midwest 1'),
    ('Midwest 2'),
    ('New England 1'),
    ('New England 2'),
    ('New England 3'),
    ('Nor Cal 1'),
    ('Nor Cal 2'),
    ('PLF'),
    ('Power Factor'),
    ('Secondary Portfolio'),
    ('So Cal 1'),
    ('So Cal 2'),
    ('So Cal 3'),
    ('SolarEdge'),
    ('SolrenView')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- TABLE 2: SITES
-- ========================================
CREATE TABLE IF NOT EXISTS sites (
    site_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
    site_name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(portfolio_id, site_name)
);

-- Create index on portfolio_id for faster queries
CREATE INDEX IF NOT EXISTS idx_sites_portfolio_id ON sites(portfolio_id);

-- Sample sites (add more as needed)
INSERT INTO sites (portfolio_id, site_name) 
SELECT portfolio_id, 'Site 1' FROM portfolios WHERE name = 'Aurora'
ON CONFLICT DO NOTHING;

INSERT INTO sites (portfolio_id, site_name)
SELECT portfolio_id, 'Site 2' FROM portfolios WHERE name = 'Aurora'
ON CONFLICT DO NOTHING;

-- ========================================
-- TABLE 3: ISSUES
-- ========================================
CREATE TABLE IF NOT EXISTS issues (
    issue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(site_id) ON DELETE SET NULL,
    reporter_name VARCHAR(100),
    entered_by VARCHAR(100) DEFAULT 'System',
    monitored_by VARCHAR(100),
    issues_missed_by VARCHAR(100),
    issue_present VARCHAR(3) NOT NULL CHECK (issue_present IN ('Yes', 'No')),
    issue_details TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    case_number VARCHAR(50),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    resolution_notes TEXT,
    issue_hour INTEGER NOT NULL CHECK (issue_hour >= 0 AND issue_hour <= 23),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_issues_portfolio_id ON issues(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_issues_site_id ON issues(site_id);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);
CREATE INDEX IF NOT EXISTS idx_issues_issue_hour ON issues(issue_hour);
CREATE INDEX IF NOT EXISTS idx_issues_issue_present ON issues(issue_present);

-- ========================================
-- FUNCTION: Auto-update updated_at timestamp
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
CREATE TRIGGER update_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS) - Optional
-- Enable if you want to add authentication
-- ========================================

-- Enable RLS on all tables (uncomment if using authentication)
-- ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Create policies (uncomment if using authentication)
-- For read access (anyone can read)
-- CREATE POLICY "Allow public read access on portfolios" ON portfolios FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access on sites" ON sites FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access on issues" ON issues FOR SELECT USING (true);

-- For write access (anyone can write - adjust based on your needs)
-- CREATE POLICY "Allow public insert on issues" ON issues FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update on issues" ON issues FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete on issues" ON issues FOR DELETE USING (true);

-- ========================================
-- SAMPLE DATA FOR TESTING
-- ========================================

-- Insert sample issues for testing
DO $$
DECLARE
    v_portfolio_id UUID;
    v_hour INTEGER;
BEGIN
    -- Get a random portfolio
    SELECT portfolio_id INTO v_portfolio_id 
    FROM portfolios 
    WHERE name = 'Midwest 1' 
    LIMIT 1;
    
    -- Insert sample issues for today at different hours
    FOR v_hour IN 8..12 LOOP
        INSERT INTO issues (
            portfolio_id,
            issue_hour,
            issue_present,
            issue_details,
            case_number,
            monitored_by,
            issues_missed_by,
            entered_by
        ) VALUES (
            v_portfolio_id,
            v_hour,
            CASE WHEN v_hour % 2 = 0 THEN 'No' ELSE 'Yes' END,
            CASE 
                WHEN v_hour % 2 = 0 THEN 'No issue present'
                ELSE 'Sample issue detected at hour ' || v_hour
            END,
            CASE WHEN v_hour % 2 = 1 THEN (45 + v_hour)::TEXT ELSE NULL END,
            CASE WHEN v_hour % 3 = 0 THEN 'Kumar S' ELSE 'Lakshmi B' END,
            CASE WHEN v_hour % 2 = 1 THEN 'Deepa L' ELSE NULL END,
            'System'
        );
    END LOOP;
END $$;

-- Insert sample issues for BESS & Trimark
DO $$
DECLARE
    v_portfolio_id UUID;
BEGIN
    SELECT portfolio_id INTO v_portfolio_id 
    FROM portfolios 
    WHERE name = 'BESS & Trimark' 
    LIMIT 1;
    
    INSERT INTO issues (
        portfolio_id,
        issue_hour,
        issue_present,
        issue_details,
        case_number,
        monitored_by,
        issues_missed_by
    ) VALUES
        (v_portfolio_id, 14, 'No', 'No issue present', '67', 'Bharat Gu', 'Anjana'),
        (v_portfolio_id, 11, 'No', 'No issue present', '12', 'jenny', 'Jane Smith'),
        (v_portfolio_id, 10, 'No', 'No issue present', '9', 'Deepa L', 'Arun V'),
        (v_portfolio_id, 9, 'No', 'No issue present', NULL, NULL, NULL);
END $$;

-- Insert sample issues for Locus
DO $$
DECLARE
    v_portfolio_id UUID;
BEGIN
    SELECT portfolio_id INTO v_portfolio_id 
    FROM portfolios 
    WHERE name = 'Locus' 
    LIMIT 1;
    
    INSERT INTO issues (
        portfolio_id,
        issue_hour,
        issue_present,
        issue_details,
        case_number,
        monitored_by,
        issues_missed_by
    ) VALUES
        (v_portfolio_id, 10, 'No', 'No issue present', '5', 'Anita P', 'Anita P');
END $$;

-- ========================================
-- VIEWS FOR COMMON QUERIES (Optional)
-- ========================================

-- View for issues with portfolio names
CREATE OR REPLACE VIEW issues_with_portfolio AS
SELECT 
    i.*,
    p.name AS portfolio_name,
    s.site_name
FROM issues i
JOIN portfolios p ON i.portfolio_id = p.portfolio_id
LEFT JOIN sites s ON i.site_id = s.site_id;

-- View for today's coverage
CREATE OR REPLACE VIEW todays_coverage AS
SELECT 
    issue_hour,
    COUNT(DISTINCT portfolio_id) AS unique_portfolios,
    COUNT(*) AS total_issues
FROM issues
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY issue_hour
ORDER BY issue_hour;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check portfolios
SELECT 'Portfolios Count' AS check_type, COUNT(*) AS count FROM portfolios;

-- Check sites
SELECT 'Sites Count' AS check_type, COUNT(*) AS count FROM sites;

-- Check issues
SELECT 'Issues Count' AS check_type, COUNT(*) AS count FROM issues;

-- Show sample data
SELECT 
    p.name AS portfolio,
    i.issue_hour,
    i.issue_present,
    i.monitored_by,
    i.created_at
FROM issues i
JOIN portfolios p ON i.portfolio_id = p.portfolio_id
ORDER BY i.created_at DESC
LIMIT 10;

-- ========================================
-- USEFUL MAINTENANCE QUERIES
-- ========================================

-- Delete all issues (use with caution)
-- DELETE FROM issues;

-- Reset auto-increment
-- ALTER SEQUENCE issues_id_seq RESTART WITH 1;

-- Vacuum and analyze for performance
-- VACUUM ANALYZE portfolios;
-- VACUUM ANALYZE sites;
-- VACUUM ANALYZE issues;

-- ========================================
-- BACKUP REMINDER
-- ========================================
-- Remember to backup your database regularly!
-- In Supabase, go to Settings > Database > Database backups

-- ========================================
-- END OF DATABASE SETUP
-- ========================================

SELECT '✅ Database setup complete!' AS status;