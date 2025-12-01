-- Add site_range column to portfolios table in Supabase
-- Run this in your Supabase SQL Editor

ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS site_range VARCHAR(255);

-- ========================================
-- POPULATE SITE RANGES FOR PORTFOLIOS
-- ========================================
-- Update each portfolio with its site range
-- Modify these values based on your actual site ranges

UPDATE portfolios SET site_range = 'Sites 1-50' WHERE name = 'Aurora';
UPDATE portfolios SET site_range = 'Sites 1-100' WHERE name = 'Mid Atlantic 1';
UPDATE portfolios SET site_range = 'Sites 1-75' WHERE name = 'Mid Atlantic 2';
UPDATE portfolios SET site_range = 'Sites 1-80' WHERE name = 'Midwest 1';
UPDATE portfolios SET site_range = 'Sites 1-90' WHERE name = 'Midwest 2';
UPDATE portfolios SET site_range = 'Sites 1-60' WHERE name = 'New England 1';
UPDATE portfolios SET site_range = 'Sites 1-65' WHERE name = 'New England 2';
UPDATE portfolios SET site_range = 'Sites 1-70' WHERE name = 'New England 3';
UPDATE portfolios SET site_range = 'Sites 1-85' WHERE name = 'Nor Cal 1';
UPDATE portfolios SET site_range = 'Sites 1-95' WHERE name = 'Nor Cal 2';
UPDATE portfolios SET site_range = 'Sites 1-110' WHERE name = 'So Cal 1';
UPDATE portfolios SET site_range = 'Sites 1-120' WHERE name = 'So Cal 2';
UPDATE portfolios SET site_range = 'Sites 1-105' WHERE name = 'So Cal 3';
UPDATE portfolios SET site_range = 'Sites 1-40' WHERE name = 'Guarantee Sites';
UPDATE portfolios SET site_range = 'Sites 1-55' WHERE name = 'Intermountain West';
UPDATE portfolios SET site_range = 'Sites 1-45' WHERE name = 'Chint';
UPDATE portfolios SET site_range = 'Sites 1-35' WHERE name = 'Locus';
UPDATE portfolios SET site_range = 'Sites 1-30' WHERE name = 'SolrenView';
UPDATE portfolios SET site_range = 'Sites 1-25' WHERE name = 'SolarEdge';
UPDATE portfolios SET site_range = 'Sites 1-20' WHERE name = 'eG/GByte/PD/GPM';
UPDATE portfolios SET site_range = 'Sites 1-15' WHERE name = 'Power Factor';
UPDATE portfolios SET site_range = 'Multi Das' WHERE name = 'BESS & Trimark';

-- Add more UPDATE statements for other portfolios as needed
-- Format: UPDATE portfolios SET site_range = 'Your Site Range' WHERE name = 'Portfolio Name';

SELECT '✅ Site range column added and populated!' AS status;

