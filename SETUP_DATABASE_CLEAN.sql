-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    portfolio_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
    site_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
    site_name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
    issue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(site_id) ON DELETE SET NULL,
    reporter_name VARCHAR(100),
    entered_by VARCHAR(100) DEFAULT 'System',
    monitored_by VARCHAR(100),
    issues_missed_by VARCHAR(100),
    issue_present VARCHAR(3) NOT NULL CHECK (issue_present IN ('Yes', 'No')),
    issue_details TEXT,
    status VARCHAR(20) DEFAULT 'open',
    case_number VARCHAR(50),
    severity VARCHAR(20) DEFAULT 'medium',
    resolution_notes TEXT,
    issue_hour INTEGER NOT NULL CHECK (issue_hour >= 0 AND issue_hour <= 23),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Insert 26 portfolios
INSERT INTO portfolios (name) VALUES
    ('Aurora'), ('BESS & Trimark'), ('Chint'), ('eG/GByte/PD/GPM'),
    ('Guarantee Sites'), ('Intermountain West'), ('KK'), ('Locus'),
    ('Main Portfolio'), ('Mid Atlantic 1'), ('Mid Atlantic 2'), ('Midwest 1'),
    ('Midwest 2'), ('New England 1'), ('New England 2'), ('New England 3'),
    ('Nor Cal 1'), ('Nor Cal 2'), ('PLF'), ('Power Factor'),
    ('Secondary Portfolio'), ('So Cal 1'), ('So Cal 2'), ('So Cal 3'),
    ('SolarEdge'), ('SolrenView')
ON CONFLICT (name) DO NOTHING;

-- Verify
SELECT COUNT(*) as portfolio_count FROM portfolios;
