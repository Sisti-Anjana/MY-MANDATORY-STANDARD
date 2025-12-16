-- Add all_sites_checked_by column to track who completed all sites for a portfolio
-- Run this in Supabase SQL editor (or your Postgres DB) before using the new analytics

ALTER TABLE portfolios
ADD COLUMN IF NOT EXISTS all_sites_checked_by VARCHAR(100);


