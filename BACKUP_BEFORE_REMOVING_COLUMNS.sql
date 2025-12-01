-- ========================================
-- BACKUP SCRIPT: Before Removing Old Columns
-- ========================================
-- Run this FIRST to create a backup of your data
-- This allows you to restore if something goes wrong

-- Step 1: Create backup tables with current data
CREATE TABLE IF NOT EXISTS issues_backup AS 
SELECT * FROM issues;

CREATE TABLE IF NOT EXISTS hour_reservations_backup AS 
SELECT * FROM hour_reservations;

CREATE TABLE IF NOT EXISTS admin_logs_backup AS 
SELECT * FROM admin_logs;

CREATE TABLE IF NOT EXISTS issue_comments_backup AS 
SELECT * FROM issue_comments;

-- Step 2: Verify backup was created
SELECT 
  'issues_backup' as backup_table,
  COUNT(*) as row_count
FROM issues_backup
UNION ALL
SELECT 
  'hour_reservations_backup',
  COUNT(*)
FROM hour_reservations_backup
UNION ALL
SELECT 
  'admin_logs_backup',
  COUNT(*)
FROM admin_logs_backup
UNION ALL
SELECT 
  'issue_comments_backup',
  COUNT(*)
FROM issue_comments_backup;

-- Step 3: Export backup data (optional - for external backup)
-- You can export these tables using Supabase's export feature
-- or use pg_dump if you have database access

SELECT '✅ Backup tables created successfully!' AS status;
SELECT '⚠️ IMPORTANT: Keep these backup tables until you confirm everything works!' AS warning;


