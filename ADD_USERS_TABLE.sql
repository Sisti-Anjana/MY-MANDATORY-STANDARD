-- ========================================
-- USER AUTHENTICATION TABLE
-- Supabase PostgreSQL Database Schema
-- ========================================

-- Create users table for authentication
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

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert default users
-- Note: In production, passwords should be properly hashed
-- For now, using simple passwords (these should be hashed with bcrypt in production)
INSERT INTO users (username, password_hash, full_name, role) VALUES
    ('admin', 'admin123', 'System Administrator', 'admin'),
    ('user1', 'user123', 'Regular User 1', 'user'),
    ('user2', 'user123', 'Regular User 2', 'user')
ON CONFLICT (username) DO NOTHING;

-- Add session tracking table
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

-- Verification query
SELECT '✅ Users table created successfully!' AS status;
SELECT username, full_name, role FROM users;
