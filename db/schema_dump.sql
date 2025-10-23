-- Simple dump of schema (based on db/init/01_schema.sql)

-- users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  department_id INTEGER,
  team VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- departments
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- report_types
CREATE TABLE IF NOT EXISTS report_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  frequency VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- reports
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  report_type_id INTEGER REFERENCES report_types(id) ON DELETE SET NULL,
  file_path TEXT,
  status VARCHAR(50) DEFAULT 'Pending',
  due_date DATE,
  submitted_at TIMESTAMP,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- review_history
CREATE TABLE IF NOT EXISTS review_history (
  id SERIAL PRIMARY KEY,
  report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100),
  payload JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
