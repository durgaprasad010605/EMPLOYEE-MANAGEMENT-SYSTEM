package com.employeetracker.controller;

import com.employeetracker.dto.ApiResponse;
import com.employeetracker.security.UserPrincipal;
import com.employeetracker.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/hr")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHrDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getHrDashboard()));
    }

    @GetMapping("/employee")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeDashboard(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getEmployeeDashboard(principal.getEmployeeId())));
    }

    // Default route returning role-aware dashboard
    @GetMapping({"", "/summary"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getGeneralDashboard(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            if ("HR".equalsIgnoreCase(principal.getRole())) {
                return ResponseEntity.ok(ApiResponse.ok(dashboardService.getHrDashboard()));
            } else {
                return ResponseEntity.ok(ApiResponse.ok(dashboardService.getEmployeeDashboard(principal.getEmployeeId())));
            }
        }
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getHrDashboard()));
    }
}
