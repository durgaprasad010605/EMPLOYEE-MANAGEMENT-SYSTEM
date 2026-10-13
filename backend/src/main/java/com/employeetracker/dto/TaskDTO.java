package com.employeetracker.dto;

import com.employeetracker.entity.Task;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private String projectCode;
    private String title;
    private String description;
    private Long assignedEmployeeId;
    private String assignedEmployeeName;
    private String assignedEmployeeCode;
    private Long createdByHrId;
    private String createdByHrName;
    private String priority;
    private String status;
    private LocalDate startDate;
    private LocalDate deadline;
    private boolean overdue;
    private Integer latestProgressPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TaskDTO() {}

    public static TaskDTO fromEntity(Task t, Integer latestProgress) {
        if (t == null) return null;
        TaskDTO dto = new TaskDTO();
        dto.setId(t.getId());
        if (t.getProject() != null) {
            dto.setProjectId(t.getProject().getId());
            dto.setProjectName(t.getProject().getName());
            dto.setProjectCode(t.getProject().getProjectCode());
        }
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        if (t.getAssignedEmployee() != null) {
            dto.setAssignedEmployeeId(t.getAssignedEmployee().getId());
            dto.setAssignedEmployeeName(t.getAssignedEmployee().getFullName());
            dto.setAssignedEmployeeCode(t.getAssignedEmployee().getEmployeeCode());
        }
        if (t.getCreatedByHr() != null) {
            dto.setCreatedByHrId(t.getCreatedByHr().getId());
            dto.setCreatedByHrName(t.getCreatedByHr().getFullName());
        }
        dto.setPriority(t.getPriority());
        dto.setStatus(t.getStatus());
        dto.setStartDate(t.getStartDate());
        dto.setDeadline(t.getDeadline());
        dto.setOverdue(t.isOverdue());
        dto.setLatestProgressPercentage(latestProgress != null ? latestProgress : ("COMPLETED".equalsIgnoreCase(t.getStatus()) ? 100 : 0));
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getAssignedEmployeeId() { return assignedEmployeeId; }
    public void setAssignedEmployeeId(Long assignedEmployeeId) { this.assignedEmployeeId = assignedEmployeeId; }

    public String getAssignedEmployeeName() { return assignedEmployeeName; }
    public void setAssignedEmployeeName(String assignedEmployeeName) { this.assignedEmployeeName = assignedEmployeeName; }

    public String getAssignedEmployeeCode() { return assignedEmployeeCode; }
    public void setAssignedEmployeeCode(String assignedEmployeeCode) { this.assignedEmployeeCode = assignedEmployeeCode; }

    public Long getCreatedByHrId() { return createdByHrId; }
    public void setCreatedByHrId(Long createdByHrId) { this.createdByHrId = createdByHrId; }

    public String getCreatedByHrName() { return createdByHrName; }
    public void setCreatedByHrName(String createdByHrName) { this.createdByHrName = createdByHrName; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public boolean isOverdue() { return overdue; }
    public void setOverdue(boolean overdue) { this.overdue = overdue; }

    public Integer getLatestProgressPercentage() { return latestProgressPercentage; }
    public void setLatestProgressPercentage(Integer latestProgressPercentage) { this.latestProgressPercentage = latestProgressPercentage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
