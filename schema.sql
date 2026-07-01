-- MuniFix Ctg Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types dynamically if they do not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('citizen', 'field_worker', 'dept_admin', 'super_admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_category') THEN
        CREATE TYPE complaint_category AS ENUM ('Waterlogging', 'Road Repair', 'Waste Management', 'Electricity', 'Other');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_priority') THEN
        CREATE TYPE complaint_priority AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_status') THEN
        CREATE TYPE complaint_status AS ENUM ('pending', 'assigned', 'in_progress', 'resolved', 'cancelled');
    END IF;
END$$;

-- Create Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    image_url VARCHAR(255),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    category complaint_category NOT NULL DEFAULT 'Other',
    priority complaint_priority NOT NULL DEFAULT 'medium',
    status complaint_status NOT NULL DEFAULT 'pending',
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    ai_category VARCHAR(100),
    ai_priority VARCHAR(50),
    ai_confidence_score DECIMAL(5,2),
    ai_override BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE UNIQUE,
    worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Status History Table
CREATE TABLE IF NOT EXISTS status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create OTP Verifications Table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    otp_code VARCHAR(6),
    expires_at TIMESTAMP,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id UUID,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data

-- Seed Departments
INSERT INTO departments (id, name, description) VALUES
(1, 'Waterlogging', 'Deals with drainage, flooding, and water logging issues'),
(2, 'Road Repair', 'Deals with potholes, road surface damage, and traffic signals'),
(3, 'Waste Management', 'Deals with garbage pickup, public cleaning, and waste disposal'),
(4, 'Electricity', 'Deals with street lighting, power cuts, and municipal grid issues')
ON CONFLICT (name) DO NOTHING;

-- Seed Sample Users
-- (Passwords are pre-hashed for convenience using bcrypt cost 10 'password123')
INSERT INTO users (id, name, email, phone, password, role, department_id) VALUES
('c59d9c2e-4b6b-4e12-87ad-d345ff4b10b0', 'Super Admin', 'admin@munifix.gov', '01700000001', '$2b$10$tZ261e4W3vA.s7z3kR.6t.Qo672yE5lYtJ2a9R01sF0l3K101r32W', 'super_admin', NULL),
('f19d2bba-ea7f-4422-b5e1-55c3272e276b', 'John Citizen', 'john@gmail.com', '01712345678', '$2b$10$tZ261e4W3vA.s7z3kR.6t.Qo672yE5lYtJ2a9R01sF0l3K101r32W', 'citizen', NULL),
('b2569e5d-16a8-4c22-b1e1-88f1c3272e7c', 'Rahim Worker', 'rahim@munifix.gov', '01723456789', '$2b$10$tZ261e4W3vA.s7z3kR.6t.Qo672yE5lYtJ2a9R01sF0l3K101r32W', 'field_worker', 3),
('a871cb2b-7c7f-4522-a9e1-66e3c3272e1d', 'Waste Admin', 'wasteadmin@munifix.gov', '01734567890', '$2b$10$tZ261e4W3vA.s7z3kR.6t.Qo672yE5lYtJ2a9R01sF0l3K101r32W', 'dept_admin', 3),
('e402bba2-da7f-4122-83e1-77d3c3272e2e', 'Roads Admin', 'roadsadmin@munifix.gov', '01745678901', '$2b$10$tZ261e4W3vA.s7z3kR.6t.Qo672yE5lYtJ2a9R01sF0l3K101r32W', 'dept_admin', 2)
ON CONFLICT (email) DO NOTHING;
