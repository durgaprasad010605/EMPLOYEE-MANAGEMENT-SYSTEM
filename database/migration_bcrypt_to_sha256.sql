-- =====================================================================
-- SAFE MIGRATION PLAN: BCrypt to SHA-256 Hash Migration
-- Database Name: employee_tracker
--
-- IMPORTANT SAFETY NOTICE:
-- BCrypt hashes cannot be mathematically converted into SHA-256 hashes
-- because both are one-way cryptographic hash functions.
--
-- To safely migrate existing accounts without data loss or downtime:
-- 1. Identify users currently holding legacy BCrypt hashes.
-- 2. Generate new SHA-256 hashes using the standard Java utility:
--      javac PasswordHashGenerator.java
--      java PasswordHashGenerator <NewPassword>
-- 3. Execute the targeted UPDATE statement for each user.
-- 4. Verify that each account's role, profile, and status are preserved.
-- =====================================================================

USE `employee_tracker`;

-- =====================================================================
-- STEP 1: Audit accounts with legacy BCrypt hashes
-- =====================================================================
SELECT 
    id,
    username,
    email,
    role,
    enabled,
    CASE 
        WHEN password_hash LIKE '$2%' THEN 'LEGACY_BCRYPT'
        WHEN LENGTH(password_hash) = 64 THEN 'SHA256_ACTIVE'
        ELSE 'UNKNOWN_FORMAT'
    END AS hash_format,
    LEFT(password_hash, 10) AS hash_preview
FROM users;

-- =====================================================================
-- STEP 2: Update existing accounts with their new SHA-256 hashes
-- =====================================================================
-- Example: To set password to Admin@123
-- SHA-256 for "Admin@123": e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7
--
-- UPDATE `users` 
-- SET `password_hash` = 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7'
-- WHERE `username` = 'admin';

-- Template for migrating specific users:
-- UPDATE `users` SET `password_hash` = '<NEW_SHA256_HEX_HASH>' WHERE `username` = 'hr';
-- UPDATE `users` SET `password_hash` = '<NEW_SHA256_HEX_HASH>' WHERE `username` = 'manager';
-- UPDATE `users` SET `password_hash` = '<NEW_SHA256_HEX_HASH>' WHERE `username` = 'rahul';

-- =====================================================================
-- STEP 3: Post-Migration Consistency Verification
-- =====================================================================
SELECT 
    u.id AS user_id,
    u.username,
    u.email,
    u.role,
    u.enabled,
    LENGTH(u.password_hash) AS hash_length,
    CASE 
        WHEN LENGTH(u.password_hash) = 64 AND u.password_hash NOT LIKE '$%' THEN 'MIGRATION_COMPLETE'
        ELSE 'PENDING_MIGRATION'
    END AS migration_status
FROM `users` u;
