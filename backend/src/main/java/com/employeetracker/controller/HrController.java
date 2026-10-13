package com.employeetracker.controller;

import com.employeetracker.dto.ApiResponse;
import com.employeetracker.entity.Hr;
import com.employeetracker.repository.HrRepository;
import com.employeetracker.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/hr")
public class HrController {

    @Autowired
    private HrRepository hrRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentHr(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        Hr hr = null;
        if (principal.getHrId() != null) {
            hr = hrRepository.findById(principal.getHrId()).orElse(null);
        }
        if (hr == null) {
            hr = hrRepository.findByUserId(principal.getId()).orElse(null);
        }

        Map<String, Object> map = new HashMap<>();
        if (hr != null) {
            map.put("id", hr.getId());
            map.put("userId", principal.getId());
            map.put("fullName", hr.getFullName());
            map.put("phone", hr.getPhone());
            map.put("email", principal.getEmail());
            map.put("username", principal.getUsername());
            map.put("createdAt", hr.getCreatedAt());
        } else {
            map.put("id", null);
            map.put("userId", principal.getId());
            map.put("fullName", principal.getDisplayName());
            map.put("email", principal.getEmail());
            map.put("username", principal.getUsername());
        }
        return ResponseEntity.ok(ApiResponse.ok(map));
    }
}
