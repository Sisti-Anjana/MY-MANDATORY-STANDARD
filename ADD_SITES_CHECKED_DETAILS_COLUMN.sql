-- Add sites_checked_details column to portfolios table in Supabase
-- Run this in your Supabase SQL Editor

ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS sites_checked_details TEXT;

-- This column will store text like "Site 1 to Site 5" or "Sites 1-10" 
-- when user selects "No" for "All sites checked"

SELECT '✅ Sites checked details column added to portfolios table!' AS status;

