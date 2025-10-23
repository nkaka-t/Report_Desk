# ERD - ReportDesk (simplified)

Entities:

- users (id, email, password_hash, full_name, role, department_id, team, created_at)
- departments (id, name, created_at)
- report_types (id, name, department_id, frequency, created_at)
- reports (id, user_id, report_type_id, file_path, status, due_date, submitted_at, version, created_at)
- review_history (id, report_id, reviewer_id, action, comments, created_at)
- notifications (id, user_id, type, payload, read, created_at)

Relationships:
- users.department_id -> departments.id (many users in one department)
- report_types.department_id -> departments.id (many report types per department)
- reports.user_id -> users.id (reports submitted by user)
- reports.report_type_id -> report_types.id
- review_history.report_id -> reports.id
- review_history.reviewer_id -> users.id
