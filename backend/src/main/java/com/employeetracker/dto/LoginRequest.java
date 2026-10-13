package com.employeetracker.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    private String username;

    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private boolean rememberMe;

    public LoginRequest() {}

    public String getUsername() {
        if (username != null && !username.isBlank()) {
            return username;
        }
        return email;
    }

    public void setUsername(String username) {
        this.username = username;
        if (this.email == null) {
            this.email = username;
        }
    }

    public String getEmail() {
        if (email != null && !email.isBlank()) {
            return email;
        }
        return username;
    }

    public void setEmail(String email) {
        this.email = email;
        if (this.username == null) {
            this.username = email;
        }
    }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public boolean isRememberMe() { return rememberMe; }
    public void setRememberMe(boolean rememberMe) { this.rememberMe = rememberMe; }
}
