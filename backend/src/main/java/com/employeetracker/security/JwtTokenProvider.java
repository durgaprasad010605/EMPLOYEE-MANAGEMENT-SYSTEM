package com.employeetracker.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Arrays;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationInMs;

    private Key getSigningKey() {
        byte[] keyBytes;
        try {
            if (jwtSecret != null && jwtSecret.matches("^[0-9a-fA-F]+$") && jwtSecret.length() >= 64) {
                int len = jwtSecret.length();
                keyBytes = new byte[len / 2];
                for (int i = 0; i < len; i += 2) {
                    keyBytes[i / 2] = (byte) ((Character.digit(jwtSecret.charAt(i), 16) << 4)
                            + Character.digit(jwtSecret.charAt(i + 1), 16));
                }
            } else if (jwtSecret != null) {
                keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            } else {
                keyBytes = "DefaultSecureSecretKeyForEmployeeTrackerJWTSigning123456".getBytes(StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            keyBytes = (jwtSecret != null ? jwtSecret : "DefaultSecureSecretKey1234567890").getBytes(StandardCharsets.UTF_8);
        }

        if (keyBytes.length < 32) {
            keyBytes = Arrays.copyOf(keyBytes, 32);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        String authority = userPrincipal.getAuthorities().isEmpty() ? "ROLE_EMPLOYEE" : userPrincipal.getAuthorities().iterator().next().getAuthority();

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .claim("userId", userPrincipal.getId())
                .claim("email", userPrincipal.getEmail())
                .claim("role", authority)
                .claim("displayName", userPrincipal.getDisplayName())
                .claim("hrId", userPrincipal.getHrId())
                .claim("employeeId", userPrincipal.getEmployeeId())
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromJwt(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
