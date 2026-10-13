-- =====================================================================
-- Employee Management System - Database Schema
-- Database Name: employee_tracker
-- Compatible with MySQL 8.0+
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `employee_tracker` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `employee_tracker`;

-- Table A: users (Stores authentication data for both HR and employees)
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_users_username` (`username`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table B: hr (Stores HR-specific profiles)
CREATE TABLE IF NOT EXISTS `hr` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL UNIQUE,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(25) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_hr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table C: employees (Stores employee-specific profiles)
CREATE TABLE IF NOT EXISTS `employees` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL UNIQUE,
    `employee_code` VARCHAR(50) NOT NULL UNIQUE,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(25) NULL,
    `designation` VARCHAR(100) NOT NULL,
    `joining_date` DATE NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_employees_code` (`employee_code`),
    INDEX `idx_employees_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table D: projects (Managed by HR)
CREATE TABLE IF NOT EXISTS `projects` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `project_code` VARCHAR(50) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `objectives` TEXT NULL,
    `start_date` DATE NOT NULL,
    `original_deadline` DATE NOT NULL,
    `current_deadline` DATE NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    `created_by_hr_id` BIGINT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_projects_hr` FOREIGN KEY (`created_by_hr_id`) REFERENCES `hr` (`id`),
    INDEX `idx_projects_code` (`project_code`),
    INDEX `idx_projects_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table E: project_members (Project teams and member roles)
CREATE TABLE IF NOT EXISTS `project_members` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT NOT NULL,
    `employee_id` BIGINT NOT NULL,
    `project_role` VARCHAR(100) NOT NULL,
    `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT `fk_pm_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pm_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
    UNIQUE KEY `uk_project_employee_active` (`project_id`, `employee_id`),
    INDEX `idx_pm_project` (`project_id`),
    INDEX `idx_pm_employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table F: tasks (Tasks assigned to team members on projects)
CREATE TABLE IF NOT EXISTS `tasks` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `assigned_employee_id` BIGINT NOT NULL,
    `created_by_hr_id` BIGINT NOT NULL,
    `priority` VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    `status` VARCHAR(20) NOT NULL DEFAULT 'TODO',
    `start_date` DATE NOT NULL,
    `deadline` DATE NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tasks_employee` FOREIGN KEY (`assigned_employee_id`) REFERENCES `employees` (`id`),
    CONSTRAINT `fk_tasks_hr` FOREIGN KEY (`created_by_hr_id`) REFERENCES `hr` (`id`),
    INDEX `idx_tasks_project` (`project_id`),
    INDEX `idx_tasks_employee` (`assigned_employee_id`),
    INDEX `idx_tasks_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table G: progress_updates (Immutable historical task progress submissions)
CREATE TABLE IF NOT EXISTS `progress_updates` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `task_id` BIGINT NOT NULL,
    `employee_id` BIGINT NOT NULL,
    `work_completed` TEXT NOT NULL,
    `remaining_work` TEXT NOT NULL,
    `progress_percentage` INT NOT NULL,
    `blockers` TEXT NULL,
    `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_pu_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pu_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
    INDEX `idx_pu_task` (`task_id`),
    INDEX `idx_pu_employee` (`employee_id`),
    INDEX `idx_pu_submitted_at` (`submitted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table H: extension_requests (Project deadline extensions requested by employees)
CREATE TABLE IF NOT EXISTS `extension_requests` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT NOT NULL,
    `requested_by_employee_id` BIGINT NOT NULL,
    `current_deadline` DATE NOT NULL,
    `requested_deadline` DATE NOT NULL,
    `reason` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `reviewed_by_hr_id` BIGINT NULL,
    `hr_response` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `reviewed_at` DATETIME NULL,
    CONSTRAINT `fk_er_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_er_employee` FOREIGN KEY (`requested_by_employee_id`) REFERENCES `employees` (`id`),
    CONSTRAINT `fk_er_hr` FOREIGN KEY (`reviewed_by_hr_id`) REFERENCES `hr` (`id`),
    INDEX `idx_er_project` (`project_id`),
    INDEX `idx_er_employee` (`requested_by_employee_id`),
    INDEX `idx_er_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table I: leave_requests (Leave applications submitted by employees)
CREATE TABLE IF NOT EXISTS `leave_requests` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` BIGINT NOT NULL,
    `leave_type` VARCHAR(20) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `reason` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `reviewed_by_hr_id` BIGINT NULL,
    `hr_response` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `reviewed_at` DATETIME NULL,
    CONSTRAINT `fk_lr_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
    CONSTRAINT `fk_lr_hr` FOREIGN KEY (`reviewed_by_hr_id`) REFERENCES `hr` (`id`),
    INDEX `idx_lr_employee` (`employee_id`),
    INDEX `idx_lr_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table J: notifications (User targeted alerts and notifications)
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `recipient_user_id` BIGINT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `related_type` VARCHAR(50) NULL,
    `related_id` BIGINT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notif_user` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_notif_user` (`recipient_user_id`),
    INDEX `idx_notif_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
