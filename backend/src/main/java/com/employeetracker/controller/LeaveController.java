package com.employeetracker.controller;

import com.employeetracker.dto.ApiResponse;
import com.employeetracker.dto.LeaveRequestDTO;
import com.employeetracker.security.UserPrincipal;
import com.employeetracker.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<LeaveRequestDTO>> applyLeave(
            @RequestBody LeaveRequestDTO dto,
            Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        LeaveRequestDTO created = leaveService.applyLeave(principal.getEmployeeId(), dto);
        return ResponseEntity.ok(ApiResponse.ok("Leave application submitted successfully", created));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<LeaveRequestDTO>>> getMyLeaves(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        if (principal.getEmployeeId() == null) {
            return ResponseEntity.ok(ApiResponse.ok(List.of()));
        }
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getEmployeeLeaves(principal.getEmployeeId())));
    }

    @GetMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<List<LeaveRequestDTO>>> getAllLeaves(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getAllLeaves(status)));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<LeaveRequestDTO>> reviewLeave(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        String decision = body.get("decision");
        if (decision == null) decision = body.get("status");
        String hrResponse = body.get("hrResponse");

        LeaveRequestDTO reviewed = leaveService.reviewLeave(id, principal.getHrId(), decision, hrResponse);
        return ResponseEntity.ok(ApiResponse.ok("Leave request reviewed successfully", reviewed));
    }
}
