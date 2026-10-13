package com.employeetracker.controller;

import com.employeetracker.dto.ApiResponse;
import com.employeetracker.dto.ProgressUpdateDTO;
import com.employeetracker.dto.TaskDTO;
import com.employeetracker.security.UserPrincipal;
import com.employeetracker.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // GET /api/tasks/my
    @GetMapping("/tasks/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> getMyTasks(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        if (principal.getEmployeeId() == null) {
            return ResponseEntity.ok(ApiResponse.ok(List.of()));
        }
        return ResponseEntity.ok(ApiResponse.ok(taskService.getTasksByEmployee(principal.getEmployeeId())));
    }

    // GET /api/tasks
    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> getAllTasks(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        if ("EMPLOYEE".equalsIgnoreCase(principal.getRole()) && principal.getEmployeeId() != null) {
            return ResponseEntity.ok(ApiResponse.ok(taskService.getTasksByEmployee(principal.getEmployeeId())));
        }
        return ResponseEntity.ok(ApiResponse.ok(taskService.getAllTasks()));
    }

    // GET /api/tasks/{id}
    @GetMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskDTO>> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.getTaskById(id)));
    }

    // GET /api/projects/{projectId}/tasks
    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> getTasksByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.getTasksByProject(projectId)));
    }

    // POST /api/projects/{projectId}/tasks
    @PostMapping("/projects/{projectId}/tasks")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<TaskDTO>> createTask(
            @PathVariable Long projectId,
            @RequestBody TaskDTO taskDTO,
            Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        TaskDTO created = taskService.createTask(projectId, taskDTO, principal.getHrId());
        return ResponseEntity.ok(ApiResponse.ok("Task created successfully", created));
    }

    // PUT /api/tasks/{id}
    @PutMapping("/tasks/{id}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTask(
            @PathVariable Long id,
            @RequestBody TaskDTO taskDTO) {
        TaskDTO updated = taskService.updateTask(id, taskDTO);
        return ResponseEntity.ok(ApiResponse.ok("Task updated successfully", updated));
    }

    // PATCH /api/tasks/{id}/status
    @PatchMapping("/tasks/{id}/status")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        boolean isHr = "HR".equalsIgnoreCase(principal.getRole());
        String status = body.get("status");
        TaskDTO updated = taskService.updateTaskStatus(id, status, principal.getEmployeeId(), isHr);
        return ResponseEntity.ok(ApiResponse.ok("Task status updated successfully", updated));
    }

    // POST /api/tasks/{id}/progress
    @PostMapping("/tasks/{id}/progress")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProgressUpdateDTO>> submitProgress(
            @PathVariable Long id,
            @RequestBody ProgressUpdateDTO progressDTO,
            Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        ProgressUpdateDTO saved = taskService.submitProgress(id, principal.getEmployeeId(), progressDTO);
        return ResponseEntity.ok(ApiResponse.ok("Progress update submitted successfully", saved));
    }

    // GET /api/tasks/{id}/progress
    @GetMapping("/tasks/{id}/progress")
    public ResponseEntity<ApiResponse<List<ProgressUpdateDTO>>> getTaskProgress(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.getProgressForTask(id)));
    }

    // GET /api/progress/my
    @GetMapping("/progress/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<ProgressUpdateDTO>>> getMyProgress(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        if (principal.getEmployeeId() == null) {
            return ResponseEntity.ok(ApiResponse.ok(List.of()));
        }
        return ResponseEntity.ok(ApiResponse.ok(taskService.getProgressForEmployee(principal.getEmployeeId())));
    }

    // GET /api/projects/{id}/progress
    @GetMapping("/projects/{id}/progress")
    public ResponseEntity<ApiResponse<List<ProgressUpdateDTO>>> getProjectProgress(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.getProgressForProject(id)));
    }
}
