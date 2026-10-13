package com.employeetracker.controller;

import com.employeetracker.dto.ApiResponse;
import com.employeetracker.dto.ExtensionRequestDTO;
import com.employeetracker.security.UserPrincipal;
import com.employeetracker.service.ExtensionRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/extension-requests")
public class ExtensionRequestController {

    @Autowired
    private ExtensionRequestService extensionRequestService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<ExtensionRequestDTO>> createExtensionRequest(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        Long projectId = Long.valueOf(body.get("projectId").toString());
        LocalDate requestedDeadline = LocalDate.parse(body.get("requestedDeadline").toString());
        String reason = body.get("reason").toString();

        ExtensionRequestDTO created = extensionRequestService.requestExtension(
                projectId, principal.getEmployeeId(), requestedDeadline, reason);
        return ResponseEntity.ok(ApiResponse.ok("Extension request submitted successfully", created));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<ExtensionRequestDTO>>> getMyExtensionRequests(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        if (principal.getEmployeeId() == null) {
            return ResponseEntity.ok(ApiResponse.ok(List.of()));
        }
        return ResponseEntity.ok(ApiResponse.ok(extensionRequestService.getEmployeeRequests(principal.getEmployeeId())));
    }

    @GetMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<List<ExtensionRequestDTO>>> getAllExtensionRequests(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(extensionRequestService.getAllRequests(status)));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<ExtensionRequestDTO>> reviewExtension(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        String decision = body.get("decision");
        if (decision == null) decision = body.get("status");
        String hrResponse = body.get("hrResponse");

        ExtensionRequestDTO reviewed = extensionRequestService.reviewExtension(
                id, principal.getHrId(), decision, hrResponse);
        return ResponseEntity.ok(ApiResponse.ok("Extension request reviewed successfully", reviewed));
    }
}
