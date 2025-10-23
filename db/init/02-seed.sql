-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create departments
INSERT INTO public.departments (name, created_at)
VALUES 
    ('IT Support', CURRENT_TIMESTAMP),
    ('HR', CURRENT_TIMESTAMP),
    ('Finance', CURRENT_TIMESTAMP),
    ('Operations', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Create report types (using department IDs)
INSERT INTO public.report_types (name, department_id, frequency, created_at)
SELECT 'Hardware Issue', d.id, 'immediate', CURRENT_TIMESTAMP FROM departments d WHERE d.name = 'IT Support'
UNION ALL
SELECT 'Software Issue', d.id, 'immediate', CURRENT_TIMESTAMP FROM departments d WHERE d.name = 'IT Support'
UNION ALL
SELECT 'Employee Onboarding', d.id, 'as-needed', CURRENT_TIMESTAMP FROM departments d WHERE d.name = 'HR'
UNION ALL
SELECT 'Monthly Financials', d.id, 'monthly', CURRENT_TIMESTAMP FROM departments d WHERE d.name = 'Finance';

-- Create initial user roles (using bcrypt hash for 'admin123')
INSERT INTO public.users (email, password_hash, full_name, role, department_id, created_at, updated_at)
SELECT 
    'admin@reportdesk.local',
    '$2b$10$GEE6d3ukTVMqxWV0LQG5EOWjcr7LEHPj57KE1QwR9xWq1CG8FkEqi',
    'System Admin',
    'admin',
    d.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM departments d WHERE d.name = 'IT Support'
ON CONFLICT (email) DO NOTHING;

-- Add reviewers for each department
INSERT INTO public.users (email, password_hash, full_name, role, department_id, created_at, updated_at)
SELECT 
    'it.reviewer@reportdesk.local',
    '$2b$10$GEE6d3ukTVMqxWV0LQG5EOWjcr7LEHPj57KE1QwR9xWq1CG8FkEqi',
    'IT Reviewer',
    'reviewer',
    d.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM departments d WHERE d.name = 'IT Support'
UNION ALL
SELECT 
    'hr.reviewer@reportdesk.local',
    '$2b$10$GEE6d3ukTVMqxWV0LQG5EOWjcr7LEHPj57KE1QwR9xWq1CG8FkEqi',
    'HR Reviewer',
    'reviewer',
    d.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM departments d WHERE d.name = 'HR'
UNION ALL
SELECT 
    'finance.reviewer@reportdesk.local',
    '$2b$10$GEE6d3ukTVMqxWV0LQG5EOWjcr7LEHPj57KE1QwR9xWq1CG8FkEqi',
    'Finance Reviewer',
    'reviewer',
    d.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM departments d WHERE d.name = 'Finance'
ON CONFLICT (email) DO NOTHING;

-- Add approver
INSERT INTO public.users (email, password_hash, full_name, role, created_at, updated_at)
VALUES (
    'approver@reportdesk.local',
    '$2b$10$GEE6d3ukTVMqxWV0LQG5EOWjcr7LEHPj57KE1QwR9xWq1CG8FkEqi',
    'Chief Approver',
    'approver',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Add regular employees
INSERT INTO public.users (email, password_hash, full_name, role, department_id, created_at, updated_at)
SELECT 
    'it.employee@reportdesk.local',
    '$2b$10$GEE6d3ukTVMqxWV0LQG5EOWjcr7LEHPj57KE1QwR9xWq1CG8FkEqi',
    'IT Employee',
    'employee',
    d.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM departments d WHERE d.name = 'IT Support'
UNION ALL
SELECT 
    'hr.employee@reportdesk.local',
    '$2b$10$GEE6d3ukTVMqxWV0LQG5EOWjcr7LEHPj57KE1QwR9xWq1CG8FkEqi',
    'HR Employee',
    'employee',
    d.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM departments d WHERE d.name = 'HR'
UNION ALL
SELECT 
    'finance.employee@reportdesk.local',
    '$2b$10$GEE6d3ukTVMqxWV0LQG5EOWjcr7LEHPj57KE1QwR9xWq1CG8FkEqi',
    'Finance Employee',
    'employee',
    d.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM departments d WHERE d.name = 'Finance'
ON CONFLICT (email) DO NOTHING;