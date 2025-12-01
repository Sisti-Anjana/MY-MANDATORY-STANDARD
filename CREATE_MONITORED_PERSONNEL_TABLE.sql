-- ========================================
-- CREATE MONITORED PERSONNEL TABLE
-- For Portfolio Issue Tracking System
-- ========================================

-- Create monitored_personnel table
CREATE TABLE IF NOT EXISTS monitored_personnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'monitor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster name lookups
CREATE INDEX IF NOT EXISTS idx_monitored_personnel_name ON monitored_personnel(name);

-- Insert default monitored personnel
INSERT INTO monitored_personnel (name, role) VALUES
    ('Anjana', 'monitor'),
    ('Anita P', 'monitor'),
    ('Arun V', 'monitor'),
    ('Bharat Gu', 'monitor'),
    ('Deepa L', 'monitor'),
    ('jenny', 'monitor'),
    ('Kumar S', 'monitor'),
    ('Lakshmi B', 'monitor'),
    ('Manoj D', 'monitor'),
    ('Rajesh K', 'monitor'),
    ('Ravi T', 'monitor'),
    ('Vikram N', 'monitor')
ON CONFLICT (name) DO NOTHING;

-- Verify the table was created
SELECT 'Monitored Personnel Table Created Successfully!' AS status;
SELECT COUNT(*) AS total_users FROM monitored_personnel;

-- Show all users
SELECT * FROM monitored_personnel ORDER BY name;
