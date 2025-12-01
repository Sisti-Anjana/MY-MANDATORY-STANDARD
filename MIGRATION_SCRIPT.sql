-- ========================================
-- MIGRATION SCRIPT: Old Schema → Normalized Schema
-- Use this if you have existing data in the old schema
-- ========================================

-- STEP 1: Backup existing data (IMPORTANT!)
-- Before running this, export your data from Supabase Dashboard

-- ========================================
-- STEP 2: Create new normalized tables
-- ========================================

-- First, run the NORMALIZED_SCHEMA.sql file
-- Then come back here to migrate existing data

-- ========================================
-- STEP 3: Migrate existing issues data
-- ========================================

-- This handles the conversion from text fields to foreign keys

-- Create a temporary function to get personnel ID from name
CREATE OR REPLACE FUNCTION get_personnel_id(person_name VARCHAR)
RETURNS UUID AS $$
DECLARE
    personnel_id UUID;
BEGIN
    SELECT id INTO personnel_id
    FROM monitored_personnel
    WHERE name = person_name;
    
    -- If not found, return NULL
    RETURN personnel_id;
END;
$$ LANGUAGE plpgsql;

-- Update existing issues if you have them
-- This converts text names to foreign key IDs
UPDATE issues i
SET 
    monitored_by_id = get_personnel_id(i.monitored_by),
    issues_missed_by_id = get_personnel_id(i.issues_missed_by);

-- ========================================
-- STEP 4: Update hour_reservations
-- ========================================

-- If you have existing hour reservations, update them
UPDATE hour_reservations hr
SET monitored_by_id = get_personnel_id(hr.monitored_by);

-- ========================================
-- STEP 5: Drop old text columns (OPTIONAL)
-- ========================================

-- WARNING: Only do this after verifying data migration was successful!

-- For issues table:
-- ALTER TABLE issues DROP COLUMN IF EXISTS monitored_by;
-- ALTER TABLE issues DROP COLUMN IF EXISTS issues_missed_by;

-- For hour_reservations table:
-- ALTER TABLE hour_reservations DROP COLUMN IF EXISTS monitored_by;

-- ========================================
-- STEP 6: Clean up
-- ========================================

DROP FUNCTION IF EXISTS get_personnel_id(VARCHAR);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check how many issues have foreign keys populated
SELECT 
    COUNT(*) AS total_issues,
    COUNT(monitored_by_id) AS with_monitored_by,
    COUNT(issues_missed_by_id) AS with_missed_by
FROM issues;

-- Check for any orphaned records (names that don't match personnel)
SELECT DISTINCT 
    i.monitored_by AS original_name,
    mp.name AS matched_name,
    CASE 
        WHEN mp.id IS NULL THEN '❌ NOT FOUND'
        ELSE '✅ MATCHED'
    END AS status
FROM issues i
LEFT JOIN monitored_personnel mp ON get_personnel_id(i.monitored_by) = mp.id
WHERE i.monitored_by IS NOT NULL
ORDER BY status, original_name;

-- Show sample migrated data
SELECT 
    issue_id,
    monitored_by_id,
    mp.name AS monitored_by_name,
    issues_missed_by_id,
    mp2.name AS missed_by_name
FROM issues
LEFT JOIN monitored_personnel mp ON monitored_by_id = mp.id
LEFT JOIN monitored_personnel mp2 ON issues_missed_by_id = mp2.id
LIMIT 10;

-- ========================================
-- ROLLBACK PLAN (Emergency)
-- ========================================

/*
If something goes wrong, you can rollback by:

1. Restore from backup
2. Or add back the text columns:

ALTER TABLE issues ADD COLUMN monitored_by VARCHAR(100);
ALTER TABLE issues ADD COLUMN issues_missed_by VARCHAR(100);
ALTER TABLE hour_reservations ADD COLUMN monitored_by VARCHAR(100);

-- Then populate them from foreign keys:
UPDATE issues i
SET 
    monitored_by = mp.name,
    issues_missed_by = mp2.name
FROM monitored_personnel mp, monitored_personnel mp2
WHERE i.monitored_by_id = mp.id
  AND i.issues_missed_by_id = mp2.id;
*/

SELECT '✅ Migration complete!' AS status;
SELECT 'Verify data above before proceeding' AS next_step;
