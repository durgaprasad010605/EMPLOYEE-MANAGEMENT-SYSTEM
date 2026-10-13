package com.employeetracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired(required = false)
    private DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Employee Tracker Backend API");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now().toString());

        boolean dbOk = false;
        try {
            if (dataSource != null) {
                try (Connection conn = dataSource.getConnection()) {
                    dbOk = conn.isValid(2);
                }
            }
        } catch (Exception e) {
            dbOk = false;
        }

        response.put("database", dbOk ? "Connected (MySQL employee_tracker)" : "Disconnected");
        return ResponseEntity.ok(response);
    }
}
