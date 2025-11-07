-- ========================================
-- DIAGNOSTIC: Check Current Constraint
-- ========================================

-- Show the ACTUAL constraint definition
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'issues'::regclass
AND conname LIKE '%issue_present%';

-- Show column definition
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'issues'
AND column_name = 'issue_present';

-- Try to see if there are any triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'issues';

-- Check RLS status and policies
SELECT 
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'issues';

-- List all policies on issues table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'issues';
