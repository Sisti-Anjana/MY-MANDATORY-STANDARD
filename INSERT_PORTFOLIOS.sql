-- Quick Fix: Insert 26 Portfolios into Database
-- Run this in Supabase SQL Editor

-- Insert all 26 portfolios
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

-- Verify portfolios were inserted
SELECT COUNT(*) as portfolio_count FROM portfolios;

-- Show all portfolios
SELECT * FROM portfolios ORDER BY name;
