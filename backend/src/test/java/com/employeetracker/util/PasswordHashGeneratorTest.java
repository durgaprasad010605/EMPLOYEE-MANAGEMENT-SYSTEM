package com.employeetracker.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordHashGeneratorTest {

    @Test
    void testCalculateSha256ReturnsLowercaseHexOfLength64() {
        String hash = PasswordHashGenerator.calculateSha256("Admin@123");
        assertNotNull(hash);
        assertEquals(64, hash.length());
        assertEquals("e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7", hash);
        assertEquals(hash.toLowerCase(), hash);
    }

    @Test
    void testVerifySucceedsForMatchingPassword() {
        String rawPassword = "SecurePassword#2026";
        String hash = PasswordHashGenerator.calculateSha256(rawPassword);

        assertTrue(PasswordHashGenerator.verify(rawPassword, hash));
        assertTrue(PasswordHashGenerator.verify(rawPassword, hash.toUpperCase())); // Case-insensitive stored hash comparison
    }

    @Test
    void testVerifyFailsForIncorrectPassword() {
        String rawPassword = "CorrectPassword123";
        String hash = PasswordHashGenerator.calculateSha256(rawPassword);

        assertFalse(PasswordHashGenerator.verify("WrongPassword123", hash));
        assertFalse(PasswordHashGenerator.verify(null, hash));
        assertFalse(PasswordHashGenerator.verify(rawPassword, null));
    }

    @Test
    void testIsLegacyBcryptHash() {
        assertTrue(PasswordHashGenerator.isLegacyBcryptHash("$2a$10$oMGKmKgZ4jaZVg.yrcf6aesWM.gR5SZgm381oOKIdq5m0ewIGOv3e"));
        assertTrue(PasswordHashGenerator.isLegacyBcryptHash("$2b$12$e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7"));
        assertTrue(PasswordHashGenerator.isLegacyBcryptHash("$2y$10$bsfQzjTq302W8pxDZisoLuJT4JUdsvY2g/nSsCl6RV2iI2Cdjamgq"));

        assertFalse(PasswordHashGenerator.isLegacyBcryptHash("e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7"));
        assertFalse(PasswordHashGenerator.isLegacyBcryptHash(null));
        assertFalse(PasswordHashGenerator.isLegacyBcryptHash(""));
    }
}
