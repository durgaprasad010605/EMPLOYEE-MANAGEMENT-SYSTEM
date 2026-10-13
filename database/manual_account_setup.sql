-- =====================================================================
-- Manual Account Setup Script (SHA-256 Hashes)
-- Database Name: employee_tracker
--
-- INSTRUCTIONS:
-- 1. Compile and run the standalone PasswordHashGenerator:
--    javac PasswordHashGenerator.java
--    java PasswordHashGenerator YourPasswordHere
--
--    Example:
--    java PasswordHashGenerator Admin@123
--    Output: e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7
--
-- 2. Replace <HR_SHA256_HASH> and <EMPLOYEE_SHA256_HASH> with your 64-char lowercase hex hash.
-- 3. Execute the SQL statements below in MySQL Workbench or mysql CLI.
-- =====================================================================

USE `employee_tracker`;

-- =====================================================================
-- 1. Insert HR Account
-- =====================================================================
-- Step 1A: Insert user record for HR
INSERT INTO `users` (`username`, `email`, `password_hash`, `role`, `enabled`, `created_at`)
VALUES ('hr_admin', 'hr@company.com', '<HR_SHA256_HASH>', 'HR', TRUE, NOW());

-- Step 1B: Insert matching HR profile (using the user id from step 1A)
INSERT INTO `hr` (`user_id`, `full_name`, `phone`, `created_at`)
VALUES (
    (SELECT `id` FROM `users` WHERE `username` = 'hr_admin'),
    'HR Administrator',
    '+91 9876543210',
    NOW()
);

-- =====================================================================
-- 2. Insert Employee Account
-- =====================================================================
-- Step 2A: Insert user record for Employee
INSERT INTO `users` (`username`, `email`, `password_hash`, `role`, `enabled`, `created_at`)
VALUES ('john_dev', 'john.doe@company.com', '<EMPLOYEE_SHA256_HASH>', 'EMPLOYEE', TRUE, NOW());

-- Step 2B: Insert matching Employee profile (using the user id from step 2A)
INSERT INTO `employees` (`user_id`, `employee_code`, `full_name`, `phone`, `designation`, `joining_date`, `status`, `created_at`)
VALUES (
    (SELECT `id` FROM `users` WHERE `username` = 'john_dev'),
    'EMP-1001',
    'John Doe',
    '+91 9123456780',
    'Senior Full Stack Developer',
    '2025-01-15',
    'ACTIVE',
    NOW()
);

-- =====================================================================
-- 3. Verification Query: Confirm consistency of accounts and profiles
-- =====================================================================
SELECT 
    u.id AS user_id,
    u.username,
    u.email,
    u.role,
    u.enabled,
    h.id AS hr_profile_id,
    h.full_name AS hr_full_name,
    e.id AS emp_profile_id,
    e.employee_code,
    e.full_name AS emp_full_name,
    e.designation,
    e.status AS emp_status
FROM `users` u
LEFT JOIN `hr` h ON u.id = h.user_id
LEFT JOIN `employees` e ON u.id = e.user_id;
