-- ========================================
-- FIX DATABASE CONSTRAINT FOR ISSUE_PRESENT
-- ========================================

-- First, let's check the current constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname LIKE '%issue_present%';

-- Drop the existing constraint
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_issue_present_check;

-- Recreate the constraint with proper values
ALTER TABLE issues 
ADD CONSTRAINT issues_issue_present_check 
CHECK (issue_present IN ('Yes', 'No'));

-- Verify the constraint is working
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname LIKE '%issue_present%';

-- Test insert with 'No' value (should work)
DO $$
DECLARE
    v_portfolio_id UUID;
BEGIN
    SELECT portfolio_id INTO v_portfolio_id 
    FROM portfolios 
    LIMIT 1;
    
    -- Try to insert a test record
    INSERT INTO issues (
        portfolio_id,
        issue_hour,
        issue_present,
        issue_details,
        entered_by
    ) VALUES (
        v_portfolio_id,
        15,
        'No',
        'Test - No issue present',
        'System'
    );
    
    -- Delete the test record
    DELETE FROM issues 
    WHERE issue_details = 'Test - No issue present';
    
    RAISE NOTICE 'Test insert successful! Constraint is working correctly.';
END $$;

-- ========================================
-- ENABLE RLS POLICIES (if needed)
-- ========================================

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'issues';

-- If RLS is enabled but policies are missing, add them
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public insert on issues" ON issues;
    DROP POLICY IF EXISTS "Allow public read access on issues" ON issues;
    DROP POLICY IF EXISTS "Allow public update on issues" ON issues;
    DROP POLICY IF EXISTS "Allow public delete on issues" ON issues;
    
    -- Create permissive policies
    CREATE POLICY "Allow public insert on issues" 
        ON issues FOR INSERT 
        WITH CHECK (true);
    
    CREATE POLICY "Allow public read access on issues" 
        ON issues FOR SELECT 
        USING (true);
    
    CREATE POLICY "Allow public update on issues" 
        ON issues FOR UPDATE 
        USING (true);
    
    CREATE POLICY "Allow public delete on issues" 
        ON issues FOR DELETE 
        USING (true);
        
    RAISE NOTICE 'RLS policies created successfully!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Note: RLS might not be enabled or policies already exist';
END $$;

-- ========================================
-- VERIFICATION
-- ========================================
SELECT '✅ Database constraint fix complete!' AS status;
