-- ========================================
-- RESTORE SCRIPT: Rollback After Removing Columns
-- ========================================
-- Use this ONLY if you need to restore after removing old columns
-- This will restore the old text columns and data

-- WARNING: This will recreate the old columns and restore data
-- Only use if you have backup tables created by BACKUP_BEFORE_REMOVING_COLUMNS.sql

-- Step 1: Re-add old text columns to issues table
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS monitored_by VARCHAR(100),
ADD COLUMN IF NOT EXISTS issues_missed_by VARCHAR(100);

-- Step 2: Re-add old text column to hour_reservations
ALTER TABLE hour_reservations
ADD COLUMN IF NOT EXISTS monitored_by VARCHAR(100);

-- Step 3: Re-add old text column to admin_logs
ALTER TABLE admin_logs
ADD COLUMN IF NOT EXISTS admin_name VARCHAR(100);

-- Step 4: Re-add old text column to issue_comments
ALTER TABLE issue_comments
ADD COLUMN IF NOT EXISTS user_name VARCHAR(100);

-- Step 5: Restore data from backup tables (if they exist)
-- Restore issues
UPDATE issues i
SET 
  monitored_by = b.monitored_by,
  issues_missed_by = b.issues_missed_by
FROM issues_backup b
WHERE i.issue_id = b.issue_id
  AND EXISTS (SELECT 1 FROM issues_backup WHERE issue_id = i.issue_id);

-- Restore hour_reservations
UPDATE hour_reservations hr
SET monitored_by = b.monitored_by
FROM hour_reservations_backup b
WHERE hr.reservation_id = b.reservation_id
  AND EXISTS (SELECT 1 FROM hour_reservations_backup WHERE reservation_id = hr.reservation_id);

-- Restore admin_logs
UPDATE admin_logs al
SET admin_name = b.admin_name
FROM admin_logs_backup b
WHERE al.log_id = b.log_id
  AND EXISTS (SELECT 1 FROM admin_logs_backup WHERE log_id = al.log_id);

-- Restore issue_comments
UPDATE issue_comments ic
SET user_name = b.user_name
FROM issue_comments_backup b
WHERE ic.comment_id = b.comment_id
  AND EXISTS (SELECT 1 FROM issue_comments_backup WHERE comment_id = ic.comment_id);

-- Step 6: Verify restoration
SELECT 
  'issues' as table_name,
  COUNT(*) as total_rows,
  COUNT(monitored_by) as has_monitored_by,
  COUNT(issues_missed_by) as has_issues_missed_by
FROM issues
UNION ALL
SELECT 
  'hour_reservations',
  COUNT(*),
  COUNT(monitored_by),
  0
FROM hour_reservations
UNION ALL
SELECT 
  'admin_logs',
  COUNT(*),
  COUNT(admin_name),
  0
FROM admin_logs
UNION ALL
SELECT 
  'issue_comments',
  COUNT(*),
  COUNT(user_name),
  0
FROM issue_comments;

SELECT '✅ Old columns restored from backup!' AS status;
SELECT '⚠️ You may need to recreate views that were dropped' AS warning;


