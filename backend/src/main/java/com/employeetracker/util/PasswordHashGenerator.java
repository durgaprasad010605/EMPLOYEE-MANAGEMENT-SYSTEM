package com.employeetracker.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Utility to generate and verify SHA-256 password hashes.
 * Built strictly with Java standard library (java.security.MessageDigest).
 * Does not require Maven or external third-party dependencies.
 */
public class PasswordHashGenerator {

    /**
     * Calculates the lowercase hexadecimal SHA-256 hash of a plain text string.
     *
     * @param input Raw plain text password
     * @return 64-character lowercase hexadecimal SHA-256 hash
     */
    public static String calculateSha256(String input) {
        if (input == null) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(encodedHash.length * 2);
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString().toLowerCase();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available in current Java runtime", e);
        }
    }

    /**
     * Verifies a raw plain text password against a stored hash using constant-time comparison.
     *
     * @param rawPassword   Plain text password entered by the user
     * @param storedHash    Stored hash from the database
     * @return true if the SHA-256 hash matches the stored hash
     */
    public static boolean verify(String rawPassword, String storedHash) {
        if (rawPassword == null || storedHash == null) {
            return false;
        }
        String calculated = calculateSha256(rawPassword);
        byte[] calculatedBytes = calculated.getBytes(StandardCharsets.UTF_8);
        byte[] storedBytes = storedHash.trim().toLowerCase().getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(calculatedBytes, storedBytes);
    }

    /**
     * Checks whether a stored hash is in the legacy BCrypt format ($2a$, $2b$, or $2y$).
     *
     * @param storedHash The hash retrieved from database
     * @return true if the hash starts with legacy BCrypt markers
     */
    public static boolean isLegacyBcryptHash(String storedHash) {
        if (storedHash == null) {
            return false;
        }
        String trimmed = storedHash.trim();
        return trimmed.startsWith("$2a$") || trimmed.startsWith("$2b$") || trimmed.startsWith("$2y$");
    }

    /**
     * Standalone CLI runner.
     * Can be invoked with: java PasswordHashGenerator <password>
     */
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("=================================================================");
            System.out.println(" SHA-256 Password Hash Generator (Java MessageDigest)");
            System.out.println("=================================================================");
            System.out.println("Usage: java PasswordHashGenerator <plainTextPassword>");
            System.out.println("Example: java PasswordHashGenerator Secret@123");
            System.out.println("=================================================================");
            return;
        }

        String rawPassword = args[0];
        String sha256Hex = calculateSha256(rawPassword);

        System.out.println("=================================================================");
        System.out.println(" Plain Text Password : " + rawPassword);
        System.out.println(" SHA-256 Hash (Hex)  : " + sha256Hex);
        System.out.println(" Verification Check  : " + verify(rawPassword, sha256Hex));
        System.out.println("=================================================================");
    }
}
