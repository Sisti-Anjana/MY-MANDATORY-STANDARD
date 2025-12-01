-- Add subtitle column to portfolios table in Supabase
-- Run this in your Supabase SQL Editor

ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS subtitle VARCHAR(100);

-- Update existing portfolios with default subtitles based on name
UPDATE portfolios SET subtitle = 'Aurora' WHERE name = 'Aurora' AND (subtitle IS NULL OR subtitle = '');
UPDATE portfolios SET subtitle = 'Multi Das' WHERE name = 'BESS & Trimark' AND (subtitle IS NULL OR subtitle = '');
UPDATE portfolios SET subtitle = 'Chint' WHERE name = 'Chint' AND (subtitle IS NULL OR subtitle = '');
UPDATE portfolios SET subtitle = 'Multiple DAS' WHERE name = 'eG/GByte/PD/GPM' AND (subtitle IS NULL OR subtitle = '');
UPDATE portfolios SET subtitle = 'Powertrack' WHERE name IN ('Guarantee Sites', 'Intermountain West', 'KK', 'Main Portfolio', 'Mid Atlantic 1', 'Mid Atlantic 2', 'Midwest 1', 'Midwest 2', 'New England 1', 'New England 2', 'New England 3', 'Nor Cal 1', 'Nor Cal 2', 'PLF', 'Secondary Portfolio', 'So Cal 1', 'So Cal 2', 'So Cal 3') AND (subtitle IS NULL OR subtitle = '');
UPDATE portfolios SET subtitle = 'Locus' WHERE name = 'Locus' AND (subtitle IS NULL OR subtitle = '');
UPDATE portfolios SET subtitle = 'Power Factor' WHERE name = 'Power Factor' AND (subtitle IS NULL OR subtitle = '');
UPDATE portfolios SET subtitle = 'SolarEdge' WHERE name = 'SolarEdge' AND (subtitle IS NULL OR subtitle = '');
UPDATE portfolios SET subtitle = 'Solrenview' WHERE name = 'SolrenView' AND (subtitle IS NULL OR subtitle = '');

SELECT '✅ Subtitle column added successfully!' AS status;

