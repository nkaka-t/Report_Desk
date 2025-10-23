-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user roles
INSERT INTO public."Users" (id, email, password, role, name, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin@reportdesk.com',
    '$2b$10$YourHashedPasswordHere',  -- Replace with actual hashed password
    'ADMIN',
    'System Admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- Create initial departments
INSERT INTO public."Departments" (id, name, created_at, updated_at)
VALUES 
    (uuid_generate_v4(), 'IT Support', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'HR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Create initial report categories
INSERT INTO public."Categories" (id, name, created_at, updated_at)
VALUES 
    (uuid_generate_v4(), 'Hardware Issue', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Software Issue', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Network Issue', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Access Request', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Create initial report statuses
INSERT INTO public."Status" (id, name, created_at, updated_at)
VALUES 
    (uuid_generate_v4(), 'Open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'In Progress', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Resolved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Closed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;