# Database Normalization Migration Guide

## Overview
This guide helps you migrate from text-based user references to proper foreign keys, achieving 3NF normalization.

## Current Issues
- `issues.monitored_by` (text) → Should be `monitored_by_user_id` (UUID FK)
- `issues.issues_missed_by` (text) → Should be `issues_missed_by_user_id` (UUID FK)
- `hour_reservations.monitored_by` (text) → Should be `monitored_by_user_id` (UUID FK)
- `admin_logs.admin_name` (text) → Should be `admin_user_id` (UUID FK)
- `issue_comments.user_name` (text) → Should be `user_id` (UUID FK)

## Migration Steps

### Phase 1: Preparation (No Downtime)
1. **Backup your database** - Always backup before migrations
2. **Review the migration script** - Check `NORMALIZE_USER_REFERENCES.sql`
3. **Test in a development environment first**

### Phase 2: Add New Columns (No Downtime)
Run the SQL script in Supabase SQL Editor:
- Adds new foreign key columns alongside existing text columns
- Creates indexes for performance
- No data loss - old columns remain

### Phase 3: Migrate Data
The script automatically:
- Matches existing text values to user IDs
- Populates the new foreign key columns
- Handles case-insensitive matching

### Phase 4: Update Application Code
Update your React components to use the new columns:

**Files to Update:**
1. `SinglePageComplete.js` - Update user references
2. `TicketLoggingTable.js` - Use user_id instead of text
3. `IssuesByUser.js` - Join with users table
4. `AdminPanel.js` - Use user_id for admin logs
5. `IssueDetailsView.js` - Use user_id for comments

**Example Changes:**
```javascript
// OLD:
monitored_by: 'John Doe'

// NEW:
monitored_by_user_id: 'uuid-here'
// Then join to get name:
SELECT u.full_name FROM issues i JOIN users u ON i.monitored_by_user_id = u.user_id
```

### Phase 5: Verify & Test
1. Test all functionality with new columns
2. Verify data integrity
3. Check performance

### Phase 6: Remove Old Columns (After Verification)
Only after everything works:
```sql
ALTER TABLE issues DROP COLUMN monitored_by;
ALTER TABLE issues DROP COLUMN issues_missed_by;
ALTER TABLE hour_reservations DROP COLUMN monitored_by;
ALTER TABLE admin_logs DROP COLUMN admin_name;
ALTER TABLE issue_comments DROP COLUMN user_name;
```

## Benefits After Migration
✅ Data integrity - No typos or inconsistencies  
✅ Better performance - Proper indexes and joins  
✅ Easier maintenance - Update user name in one place  
✅ Accurate reporting - Reliable user activity tracking  
✅ 3NF compliance - Proper normalization  

## Rollback Plan
If issues occur:
1. The old text columns are still there
2. Revert application code to use text columns
3. Drop the new foreign key columns if needed

## Important Notes
- Keep both columns during transition period
- Test thoroughly before removing old columns
- Update all queries to use joins with users table
- Consider creating a view for backward compatibility during migration

