-- Waterlily Health Survey Database Schema
-- This file contains the complete database schema for the Waterlily Health Survey application

-- Create database
CREATE DATABASE IF NOT EXISTS waterlily;
USE waterlily;

-- Users table - stores user authentication and basic information
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Demographic data table - stores user demographic information
CREATE TABLE IF NOT EXISTS demographic_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    race_ethnicity JSON, -- Store as JSON array for checkbox selections
    marital_status VARCHAR(50), -- Dropdown selection
    employment_status VARCHAR(100),
    education_level VARCHAR(100), -- Dropdown selection
    gender VARCHAR(50), -- Dropdown selection
    dob DATE,
    zip_code CHAR(5),
    household_size TINYINT UNSIGNED NULL,
    primary_language VARCHAR(50) NULL,
    veteran_status VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_demographic (user_id)
);

-- Financial data table - stores user financial information
CREATE TABLE IF NOT EXISTS financial_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    annual_income VARCHAR(50),
    has_health_insurance BOOLEAN,
    insurance_type VARCHAR(100),
    has_longterm_care_insurance BOOLEAN,
    has_estate_plan BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_financial (user_id)
);

-- User responses table - stores health data and survey responses
CREATE TABLE IF NOT EXISTS user_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    health_data JSON NOT NULL, -- Store health information as JSON
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_response (user_id)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_demographic_user_id ON demographic_data(user_id);
CREATE INDEX idx_financial_user_id ON financial_data(user_id);
CREATE INDEX idx_responses_user_id ON user_responses(user_id);
CREATE INDEX idx_responses_submitted_at ON user_responses(submitted_at);

-- Sample queries for testing (commented out)
-- SELECT * FROM users;
-- SELECT * FROM demographic_data;
-- SELECT * FROM financial_data;
-- SELECT * FROM user_responses;

-- Example of how to query all user data with joins
-- SELECT 
--     u.id, u.email, u.first_name, u.last_name,
--     d.gender, d.dob, d.marital_status, d.employment_status,
--     f.annual_income, f.has_health_insurance,
--     ur.health_data, ur.submitted_at
-- FROM users u
-- LEFT JOIN demographic_data d ON u.id = d.user_id
-- LEFT JOIN financial_data f ON u.id = f.user_id
-- LEFT JOIN user_responses ur ON u.id = ur.user_id;
