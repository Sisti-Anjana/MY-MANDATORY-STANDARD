-- ========================================
-- REMOVE OLD TEXT COLUMNS
-- ⚠️⚠️⚠️ CRITICAL WARNING ⚠️⚠️⚠️
-- ========================================
-- 
-- ❌ DO NOT RUN THIS UNLESS:
-- 1. ✅ You have run BACKUP_BEFORE_REMOVING_COLUMNS.sql FIRST
-- 2. ✅ Your application code has been updated to use new columns (monitored_by_user_id, etc.)
-- 3. ✅ You have tested ALL functionalities and they work correctly
-- 4. ✅ You have a database backup (Supabase backup or exported data)
-- 5. ✅ You understand this is IRREVERSIBLE without a backup
--
-- ⚠️ CURRENT STATUS: Your application code is STILL using old text columns!
-- ⚠️ Removing columns NOW will BREAK your application!
-- ⚠️ See SAFE_REMOVAL_GUIDE.md for complete instructions
--
-- ========================================

-- Step 0: Update views that depend on old columns
-- First, check if views exist and update them to use new foreign key columns

-- Update v_issues_detailed or issues_detailed view (if it exists)
-- This view should use the new foreign key columns and JOIN to users table
DO $$
BEGIN
    -- Check if view exists and recreate it with new columns
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'v_issues_detailed') THEN
        DROP VIEW IF EXISTS v_issues_detailed CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'issues_detailed') THEN
        DROP VIEW IF EXISTS issues_detailed CASCADE;
    END IF;
    
    -- Recreate the view using new foreign key columns
    CREATE OR REPLACE VIEW v_issues_detailed AS
    SELECT 
        i.issue_id,
        i.portfolio_id,
        p.name AS portfolio_name,
        i.site_id,
        s.site_name,
        i.reporter_name,
        i.entered_by,
        i.monitored_by_user_id,
        u1.username AS monitored_by,
        u1.full_name AS monitored_by_full_name,
        i.issues_missed_by_user_id,
        u2.username AS issues_missed_by,
        u2.full_name AS issues_missed_by_full_name,
        i.issue_present,
        i.issue_details,
        i.status,
        i.case_number,
        i.severity,
        i.resolution_notes,
        i.issue_hour,
        i.created_at,
        i.updated_at,
        i.resolved_at
    FROM issues i
    JOIN portfolios p ON i.portfolio_id = p.portfolio_id
    LEFT JOIN sites s ON i.site_id = s.site_id
    LEFT JOIN users u1 ON i.monitored_by_user_id = u1.user_id
    LEFT JOIN users u2 ON i.issues_missed_by_user_id = u2.user_id;
    
    -- Also create issues_detailed view (without v_ prefix) for compatibility
    CREATE OR REPLACE VIEW issues_detailed AS
    SELECT * FROM v_issues_detailed;
END $$;

-- Update hour_reservations_detailed view (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'hour_reservations_detailed') THEN
        DROP VIEW IF EXISTS hour_reservations_detailed CASCADE;
        
        CREATE OR REPLACE VIEW hour_reservations_detailed AS
        SELECT 
            hr.reservation_id,
            hr.portfolio_id,
            p.name AS portfolio_name,
            hr.monitored_by_user_id,
            u.username AS monitored_by,
            u.full_name AS monitored_by_full_name,
            hr.issue_hour,
            hr.created_at,
            hr.expires_at
        FROM hour_reservations hr
        JOIN portfolios p ON hr.portfolio_id = p.portfolio_id
        LEFT JOIN users u ON hr.monitored_by_user_id = u.user_id;
    END IF;
END $$;

-- Step 1: Remove old text columns from issues table
ALTER TABLE issues 
DROP COLUMN IF EXISTS monitored_by CASCADE,
DROP COLUMN IF EXISTS issues_missed_by CASCADE;

-- Step 2: Remove old text column from hour_reservations
ALTER TABLE hour_reservations
DROP COLUMN IF EXISTS monitored_by CASCADE;

-- Step 3: Remove old text column from admin_logs
ALTER TABLE admin_logs
DROP COLUMN IF EXISTS admin_name CASCADE;

-- Step 4: Remove old text column from issue_comments
ALTER TABLE issue_comments
DROP COLUMN IF EXISTS user_name CASCADE;

-- Verification: Check that columns are removed
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('issues', 'hour_reservations', 'admin_logs', 'issue_comments')
  AND column_name IN ('monitored_by', 'issues_missed_by', 'admin_name', 'user_name')
ORDER BY table_name, column_name;

-- If the query above returns 0 rows, the columns have been successfully removed.

