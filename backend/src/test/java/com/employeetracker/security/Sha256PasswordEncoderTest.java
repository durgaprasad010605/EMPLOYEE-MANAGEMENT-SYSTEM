package com.employeetracker.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

class Sha256PasswordEncoderTest {

    private final PasswordEncoder encoder = new Sha256PasswordEncoder();

    @Test
    void testEncodeProducesLowercaseSha256() {
        String encoded = encoder.encode("Employee@2026");
        assertNotNull(encoded);
        assertEquals(64, encoded.length());
        assertEquals(encoded.toLowerCase(), encoded);
    }

    @Test
    void testMatches() {
        String raw = "MyStrongPassword!";
        String encoded = encoder.encode(raw);

        assertTrue(encoder.matches(raw, encoded));
        assertFalse(encoder.matches("WrongPassword", encoded));
        assertFalse(encoder.matches(null, encoded));
        assertFalse(encoder.matches(raw, null));
    }
}
