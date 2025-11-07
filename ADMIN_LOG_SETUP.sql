-- ========================================
-- ADMIN LOG TABLE SETUP
-- For tracking admin activities and important system logs
-- ========================================

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_name VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'portfolio_added', 
        'portfolio_deleted', 
        'user_added', 
        'user_deleted',
        'issue_modified',
        'issue_deleted',
        'system_alert',
        'custom_note'
    )),
    action_description TEXT NOT NULL,
    related_portfolio_id UUID REFERENCES portfolios(portfolio_id) ON DELETE SET NULL,
    related_issue_id UUID REFERENCES issues(issue_id) ON DELETE SET NULL,
    metadata JSONB, -- For storing additional data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_name ON admin_logs(admin_name);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action_type ON admin_logs(action_type);

-- Sample admin logs
INSERT INTO admin_logs (admin_name, action_type, action_description) VALUES
    ('System', 'system_alert', 'Admin log system initialized'),
    ('Admin', 'custom_note', 'Daily monitoring started at 9:00 AM'),
    ('Admin', 'custom_note', 'All portfolios verified - no critical issues');

-- ========================================
-- USEFUL QUERIES
-- ========================================

-- Get recent admin logs
SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 20;

-- Get logs by action type
SELECT * FROM admin_logs WHERE action_type = 'custom_note' ORDER BY created_at DESC;

-- Get logs by admin
SELECT * FROM admin_logs WHERE admin_name = 'Admin' ORDER BY created_at DESC;

-- Get logs for today
SELECT * FROM admin_logs 
WHERE DATE(created_at) = CURRENT_DATE 
ORDER BY created_at DESC;

SELECT '✅ Admin logs table created successfully!' AS status;
