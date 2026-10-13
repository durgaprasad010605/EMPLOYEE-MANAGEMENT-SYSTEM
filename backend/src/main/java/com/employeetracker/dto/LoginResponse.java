package com.employeetracker.dto;

import java.util.Map;

public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Map<String, Object> user;

    public LoginResponse() {}

    public LoginResponse(String token, Map<String, Object> user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Map<String, Object> getUser() { return user; }
    public void setUser(Map<String, Object> user) { this.user = user; }
}
