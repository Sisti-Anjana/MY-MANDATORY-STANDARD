-- ========================================
-- NORMALIZATION MIGRATION: User References
-- Convert text user names to foreign keys
-- ========================================
-- This migration normalizes user references to use foreign keys
-- Run this in Supabase SQL Editor

-- Step 1: Ensure we have a unified users table
-- Create a view or table that combines all user sources
CREATE OR REPLACE VIEW unified_users AS
SELECT DISTINCT 
  COALESCE(u.user_id::text, mp.id::text, mbl.id::text) as user_id,
  COALESCE(u.username, mp.name, mbl.name) as username,
  COALESCE(u.full_name, mp.name, mbl.name) as full_name,
  COALESCE(mbl.email, NULL) as email
FROM users u
FULL OUTER JOIN monitored_personnel mp ON u.username = mp.name
FULL OUTER JOIN monitored_by_list mbl ON u.username = mbl.name;

-- Step 2: Add new foreign key columns to issues table
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS monitored_by_user_id UUID REFERENCES users(user_id),
ADD COLUMN IF NOT EXISTS issues_missed_by_user_id UUID REFERENCES users(user_id);

-- Step 3: Add new foreign key column to hour_reservations
ALTER TABLE hour_reservations
ADD COLUMN IF NOT EXISTS monitored_by_user_id UUID REFERENCES users(user_id);

-- Step 4: Add new foreign key column to admin_logs
ALTER TABLE admin_logs
ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES users(user_id);

-- Step 5: Add new foreign key column to issue_comments
ALTER TABLE issue_comments
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(user_id);

-- Step 6: Migrate existing data (match by username/name)
-- Update issues.monitored_by_user_id
UPDATE issues i
SET monitored_by_user_id = u.user_id
FROM users u
WHERE (i.monitored_by = u.username OR i.monitored_by = u.full_name)
   AND i.monitored_by_user_id IS NULL;

-- Update issues.issues_missed_by_user_id
UPDATE issues i
SET issues_missed_by_user_id = u.user_id
FROM users u
WHERE (i.issues_missed_by = u.username OR i.issues_missed_by = u.full_name)
   AND i.issues_missed_by_user_id IS NULL;

-- Update hour_reservations.monitored_by_user_id
UPDATE hour_reservations hr
SET monitored_by_user_id = u.user_id
FROM users u
WHERE (hr.monitored_by = u.username OR hr.monitored_by = u.full_name)
   AND hr.monitored_by_user_id IS NULL;

-- Update admin_logs.admin_user_id
UPDATE admin_logs al
SET admin_user_id = u.user_id
FROM users u
WHERE (al.admin_name = u.username OR al.admin_name = u.full_name)
   AND al.admin_user_id IS NULL;

-- Update issue_comments.user_id
UPDATE issue_comments ic
SET user_id = u.user_id
FROM users u
WHERE (ic.user_name = u.username OR ic.user_name = u.full_name)
   AND ic.user_id IS NULL;

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_issues_monitored_by_user_id ON issues(monitored_by_user_id);
CREATE INDEX IF NOT EXISTS idx_issues_missed_by_user_id ON issues(issues_missed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_hour_reservations_monitored_by_user_id ON hour_reservations(monitored_by_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user_id ON admin_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_user_id ON issue_comments(user_id);

-- Step 8: Verify migration
SELECT 
  'issues' as table_name,
  COUNT(*) as total_rows,
  COUNT(monitored_by_user_id) as migrated_monitored_by,
  COUNT(issues_missed_by_user_id) as migrated_missed_by
FROM issues
UNION ALL
SELECT 
  'hour_reservations',
  COUNT(*),
  COUNT(monitored_by_user_id),
  0
FROM hour_reservations
UNION ALL
SELECT 
  'admin_logs',
  COUNT(*),
  COUNT(admin_user_id),
  0
FROM admin_logs
UNION ALL
SELECT 
  'issue_comments',
  COUNT(*),
  COUNT(user_id),
  0
FROM issue_comments;

-- Note: After verifying the migration works correctly in your application,
-- you can optionally drop the old text columns:
-- ALTER TABLE issues DROP COLUMN monitored_by;
-- ALTER TABLE issues DROP COLUMN issues_missed_by;
-- ALTER TABLE hour_reservations DROP COLUMN monitored_by;
-- ALTER TABLE admin_logs DROP COLUMN admin_name;
-- ALTER TABLE issue_comments DROP COLUMN user_name;

