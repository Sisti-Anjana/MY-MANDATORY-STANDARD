-- ========================================
-- QUICK FIX: Set Up Users Table
-- Run this in Supabase SQL Editor
-- ========================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert default users (if they don't exist)
INSERT INTO users (username, password_hash, full_name, role) VALUES
    ('admin', 'admin123', 'System Administrator', 'admin'),
    ('user1', 'user123', 'Regular User 1', 'user'),
    ('user2', 'user123', 'Regular User 2', 'user')
ON CONFLICT (username) DO NOTHING;

-- Verify users were created
SELECT '✅ Users table ready!' AS status;
SELECT username, full_name, role, is_active FROM users;

