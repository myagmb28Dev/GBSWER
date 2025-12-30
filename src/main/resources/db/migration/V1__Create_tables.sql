-- V1__Create_tables.sql
-- Initial database schema for GBSWER application

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(255),
    role ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    profile_image VARCHAR(255),
    bio TEXT,
    major VARCHAR(255),
    grade INT,
    class_number INT,
    student_number INT,
    access_token VARCHAR(512),
    refresh_token VARCHAR(512),
    admission_year INT
);

-- Classes table
CREATE TABLE classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    class_code VARCHAR(6) NOT NULL UNIQUE,
    teacher_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Class participants
CREATE TABLE class_participants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    joined_at DATETIME NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Tasks
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content VARCHAR(2000),
    teacher_name VARCHAR(255),
    due_date DATE,
    type VARCHAR(255) NOT NULL,
    class_id BIGINT,
    file_path VARCHAR(255),
    file_names TEXT,
    file_urls TEXT,
    teacher_id BIGINT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Submissions
CREATE TABLE submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    submitted_at DATETIME,
    feedback VARCHAR(2000),
    status ENUM('SUBMITTED', 'REVIEWED', 'APPROVED') NOT NULL,
    reviewed_at DATETIME,
    file_names TEXT,
    file_urls TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Community
CREATE TABLE community (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content VARCHAR(5000),
    writer VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    view_count BIGINT NOT NULL DEFAULT 0,
    updated_at DATETIME,
    author_id BIGINT,
    major VARCHAR(255) NOT NULL DEFAULT 'ALL',
    file_names TEXT,
    file_urls TEXT,
    anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (author_id) REFERENCES users(id),
    INDEX idx_community_major (major)
);

-- Calendar events
CREATE TABLE calendar_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    memo VARCHAR(1000),
    color VARCHAR(7),
    show_in_schedule BOOLEAN,
    user_id BIGINT NOT NULL,
    source VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_calendar_start_date (start_date),
    INDEX idx_calendar_category (category)
);

-- Meals
CREATE TABLE meals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    meal_date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    dishes TEXT,
    calorie VARCHAR(50),
    origin_data TEXT,
    INDEX idx_meal_date (meal_date)
);

-- Timetable
CREATE TABLE timetable (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    major VARCHAR(255),
    grade INT,
    class_number INT,
    period INT,
    subject_name VARCHAR(255),
    UNIQUE KEY uk_timetable_unique (date, major, grade, class_number, period)
);
