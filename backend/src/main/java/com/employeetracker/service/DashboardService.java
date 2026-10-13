package com.employeetracker.service;

import com.employeetracker.dto.*;
import com.employeetracker.entity.Employee;
import com.employeetracker.entity.Project;
import com.employeetracker.entity.ProjectMember;
import com.employeetracker.entity.Task;
import com.employeetracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ExtensionRequestRepository extensionRequestRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    public Map<String, Object> getHrDashboard() {
        long totalEmployees = employeeRepository.count();
        long activeProjects = projectRepository.countByStatus("ACTIVE");
        long inProgressTasks = taskRepository.countByStatus("IN_PROGRESS");
        long pendingExtensionRequests = extensionRequestRepository.countByStatus("PENDING");
        long pendingLeaveRequests = leaveRequestRepository.countByStatus("PENDING");
        long pendingRequests = pendingExtensionRequests + pendingLeaveRequests;

        // Recent projects with calculated completion % and member counts
        List<Project> recentProjectsList = projectRepository.findTop5ByOrderByCreatedAtDesc();
        List<ProjectDTO> recentProjects = recentProjectsList.stream().map(p -> {
            int total = (int) taskRepository.countByProjectId(p.getId());
            int completed = (int) taskRepository.countByProjectIdAndStatus(p.getId(), "COMPLETED");
            int members = (int) projectMemberRepository.countByProject(p);
            return ProjectDTO.fromEntity(p, total, completed, members);
        }).collect(Collectors.toList());

        // Recent tasks
        List<Task> recentTasksList = taskRepository.findTop5ByOrderByCreatedAtDesc();
        List<TaskDTO> recentTasks = recentTasksList.stream().map(t -> {
            var updates = progressUpdateRepository.findByTaskIdOrderBySubmittedAtDesc(t.getId());
            Integer prog = updates.isEmpty() ? null : updates.get(0).getProgressPercentage();
            return TaskDTO.fromEntity(t, prog);
        }).collect(Collectors.toList());

        // Blocked or Overdue tasks
        List<TaskDTO> blockedOrOverdueTasks = taskRepository.findAll().stream()
                .filter(t -> "BLOCKED".equalsIgnoreCase(t.getStatus()) || t.isOverdue())
                .limit(5)
                .map(t -> {
                    var updates = progressUpdateRepository.findByTaskIdOrderBySubmittedAtDesc(t.getId());
                    Integer prog = updates.isEmpty() ? null : updates.get(0).getProgressPercentage();
                    return TaskDTO.fromEntity(t, prog);
                })
                .collect(Collectors.toList());

        // Recent progress updates
        List<ProgressUpdateDTO> recentProgress = progressUpdateRepository.findTop5ByOrderBySubmittedAtDesc().stream()
                .map(ProgressUpdateDTO::fromEntity)
                .collect(Collectors.toList());

        // Pending extension requests
        List<ExtensionRequestDTO> pendingExtensions = extensionRequestRepository.findByStatusOrderByCreatedAtDesc("PENDING").stream()
                .limit(5)
                .map(ExtensionRequestDTO::fromEntity)
                .collect(Collectors.toList());

        // Pending leave requests
        List<LeaveRequestDTO> pendingLeaves = leaveRequestRepository.findByStatusOrderByCreatedAtDesc("PENDING").stream()
                .limit(5)
                .map(LeaveRequestDTO::fromEntity)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("totalEmployees", totalEmployees);
        data.put("activeProjects", activeProjects);
        data.put("inProgressTasks", inProgressTasks);
        data.put("pendingRequests", pendingRequests);
        data.put("pendingExtensionRequests", pendingExtensionRequests);
        data.put("pendingLeaveRequests", pendingLeaveRequests);
        data.put("recentProjects", recentProjects);
        data.put("recentTasks", recentTasks);
        data.put("blockedOrOverdueTasks", blockedOrOverdueTasks);
        data.put("recentProgress", recentProgress);
        data.put("pendingExtensions", pendingExtensions);
        data.put("pendingLeaves", pendingLeaves);

        return data;
    }

    public Map<String, Object> getEmployeeDashboard(Long employeeId) {
        if (employeeId == null) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("myActiveProjects", 0);
            empty.put("myPendingTasks", 0);
            empty.put("myCompletedTasks", 0);
            empty.put("myPendingRequests", 0);
            empty.put("assignedProjects", List.of());
            empty.put("assignedTasks", List.of());
            empty.put("recentProgress", List.of());
            empty.put("pendingExtensions", List.of());
            empty.put("leaves", List.of());
            return empty;
        }

        Employee employee = employeeRepository.findById(employeeId).orElse(null);

        // Assigned project memberships
        List<ProjectMember> memberships = projectMemberRepository.findByEmployeeId(employeeId);
        List<ProjectDTO> assignedProjects = memberships.stream().map(pm -> {
            Project p = pm.getProject();
            int total = (int) taskRepository.countByProjectId(p.getId());
            int completed = (int) taskRepository.countByProjectIdAndStatus(p.getId(), "COMPLETED");
            int members = (int) projectMemberRepository.countByProject(p);
            return ProjectDTO.fromEntity(p, total, completed, members);
        }).distinct().collect(Collectors.toList());

        long activeProjectCount = assignedProjects.stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus()))
                .count();

        // Tasks assigned to this employee
        List<Task> empTasks = taskRepository.findByAssignedEmployeeId(employeeId);
        long pendingTaskCount = empTasks.stream()
                .filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus()))
                .count();
        long completedTaskCount = empTasks.stream()
                .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()))
                .count();

        List<TaskDTO> assignedTasks = empTasks.stream().map(t -> {
            var updates = progressUpdateRepository.findByTaskIdOrderBySubmittedAtDesc(t.getId());
            Integer prog = updates.isEmpty() ? null : updates.get(0).getProgressPercentage();
            return TaskDTO.fromEntity(t, prog);
        }).collect(Collectors.toList());

        // Pending extension and leave requests
        long pendingExtensionsCount = extensionRequestRepository.countByRequestedByEmployeeAndStatus(employee, "PENDING");
        long pendingLeavesCount = leaveRequestRepository.countByEmployeeAndStatus(employee, "PENDING");
        long myPendingRequests = pendingExtensionsCount + pendingLeavesCount;

        // Recent progress updates by employee
        List<ProgressUpdateDTO> recentProgress = progressUpdateRepository.findByEmployeeIdOrderBySubmittedAtDesc(employeeId).stream()
                .limit(5)
                .map(ProgressUpdateDTO::fromEntity)
                .collect(Collectors.toList());

        // Pending extensions
        List<ExtensionRequestDTO> pendingExtensions = extensionRequestRepository.findByRequestedByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .limit(5)
                .map(ExtensionRequestDTO::fromEntity)
                .collect(Collectors.toList());

        // Leaves
        List<LeaveRequestDTO> leaves = leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .limit(5)
                .map(LeaveRequestDTO::fromEntity)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("myActiveProjects", activeProjectCount);
        data.put("myPendingTasks", pendingTaskCount);
        data.put("myCompletedTasks", completedTaskCount);
        data.put("myPendingRequests", myPendingRequests);
        data.put("assignedProjects", assignedProjects);
        data.put("assignedTasks", assignedTasks);
        data.put("recentProgress", recentProgress);
        data.put("pendingExtensions", pendingExtensions);
        data.put("leaves", leaves);

        return data;
    }
}
