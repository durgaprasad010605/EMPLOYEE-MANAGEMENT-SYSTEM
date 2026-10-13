package com.employeetracker.security;

import com.employeetracker.util.PasswordHashGenerator;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Spring Security PasswordEncoder implementation using standard Java SHA-256.
 * Implements constant-time verification using MessageDigest.isEqual.
 */
public class Sha256PasswordEncoder implements PasswordEncoder {

    @Override
    public String encode(CharSequence rawPassword) {
        if (rawPassword == null) {
            return null;
        }
        return PasswordHashGenerator.calculateSha256(rawPassword.toString());
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }
        return PasswordHashGenerator.verify(rawPassword.toString(), encodedPassword);
    }
}
