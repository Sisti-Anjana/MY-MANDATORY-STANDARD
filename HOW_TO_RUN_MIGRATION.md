# How to Run the Normalization Migration

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New query"** button

### Step 2: Copy the Migration Script
1. Open the file: `NORMALIZE_USER_REFERENCES.sql`
2. Select all content (Ctrl+A)
3. Copy it (Ctrl+C)

### Step 3: Paste and Run
1. Paste the entire script into the Supabase SQL Editor
2. Click **"Run"** button (or press Ctrl+Enter)
3. Wait for execution to complete

### Step 4: Check Results
After running, you should see:
- ✅ Success messages for each step
- 📊 Verification query results showing:
  - Total rows in each table
  - How many rows were migrated
  - Migration percentage

### Step 5: Verify in Schema
1. Go to **"Database" → "Tables"** in Supabase
2. Check these tables have new columns:
   - `issues`: `monitored_by_user_id`, `issues_missed_by_user_id`
   - `hour_reservations`: `monitored_by_user_id`
   - `admin_logs`: `admin_user_id`
   - `issue_comments`: `user_id`

## What Happens

✅ **Safe Operations:**
- Adds new columns (doesn't remove old ones)
- Migrates existing data
- Creates indexes
- No data loss

⚠️ **Important:**
- Old text columns remain (your app still works)
- New foreign key columns are populated
- You can verify everything before updating code

## After Migration

1. **Verify the data** - Check migration results
2. **Test in development** - Update code gradually
3. **Update application** - Change code to use new columns
4. **Test thoroughly** - Ensure everything works
5. **Remove old columns** - Only after full verification

## Troubleshooting

**If you get errors:**
- Check that `users` table exists
- Verify user data matches (case sensitivity)
- Some rows might not migrate if user doesn't exist in users table

**If migration is incomplete:**
- Check verification query results
- Manually fix any unmatched rows
- Re-run specific UPDATE statements if needed

