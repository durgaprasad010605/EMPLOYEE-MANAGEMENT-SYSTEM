package com.employeetracker.controller;

import com.employeetracker.dto.ApiResponse;
import com.employeetracker.dto.ProjectDTO;
import com.employeetracker.dto.ProjectMemberDTO;
import com.employeetracker.security.UserPrincipal;
import com.employeetracker.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getProjects(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        if ("EMPLOYEE".equalsIgnoreCase(principal.getRole())) {
            if (principal.getEmployeeId() != null) {
                return ResponseEntity.ok(ApiResponse.ok(projectService.getProjectsForEmployee(principal.getEmployeeId())));
            }
        }
        return ResponseEntity.ok(ApiResponse.ok(projectService.getAllProjects()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDTO>> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getProjectById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<ProjectDTO>> createProject(@RequestBody ProjectDTO projectDTO, Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        ProjectDTO created = projectService.createProject(projectDTO, principal.getHrId());
        return ResponseEntity.ok(ApiResponse.ok("Project created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<ProjectDTO>> updateProject(@PathVariable Long id, @RequestBody ProjectDTO projectDTO) {
        ProjectDTO updated = projectService.updateProject(id, projectDTO);
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully", updated));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<ProjectMemberDTO>>> getProjectMembers(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getProjectMembers(id)));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<ProjectMemberDTO>> addProjectMember(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long employeeId = Long.valueOf(body.get("employeeId").toString());
        String projectRole = body.get("projectRole") != null ? body.get("projectRole").toString() : "Developer";
        ProjectMemberDTO added = projectService.addProjectMember(id, employeeId, projectRole);
        return ResponseEntity.ok(ApiResponse.ok("Member added successfully", added));
    }

    @DeleteMapping("/{id}/members/{employeeId}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<Void>> removeProjectMember(
            @PathVariable Long id,
            @PathVariable Long employeeId) {
        projectService.removeProjectMember(id, employeeId);
        return ResponseEntity.ok(ApiResponse.ok("Member removed successfully", null));
    }
}
