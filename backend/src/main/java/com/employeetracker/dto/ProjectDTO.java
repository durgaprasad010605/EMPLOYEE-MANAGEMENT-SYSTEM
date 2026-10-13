package com.employeetracker.dto;

import com.employeetracker.entity.Project;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProjectDTO {
    private Long id;
    private String projectCode;
    private String name;
    private String description;
    private String objectives;
    private LocalDate startDate;
    private LocalDate originalDeadline;
    private LocalDate currentDeadline;
    private String status;
    private Long createdByHrId;
    private String createdByHrName;
    private int totalTasks;
    private int completedTasks;
    private int completionPercentage;
    private int memberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProjectDTO() {}

    public static ProjectDTO fromEntity(Project p, int totalTasks, int completedTasks, int memberCount) {
        if (p == null) return null;
        ProjectDTO dto = new ProjectDTO();
        dto.setId(p.getId());
        dto.setProjectCode(p.getProjectCode());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setObjectives(p.getObjectives());
        dto.setStartDate(p.getStartDate());
        dto.setOriginalDeadline(p.getOriginalDeadline());
        dto.setCurrentDeadline(p.getCurrentDeadline());
        dto.setStatus(p.getStatus());
        if (p.getCreatedByHr() != null) {
            dto.setCreatedByHrId(p.getCreatedByHr().getId());
            dto.setCreatedByHrName(p.getCreatedByHr().getFullName());
        }
        dto.setTotalTasks(totalTasks);
        dto.setCompletedTasks(completedTasks);
        dto.setCompletionPercentage(totalTasks > 0 ? (int) Math.round(((double) completedTasks / totalTasks) * 100.0) : 0);
        dto.setMemberCount(memberCount);
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }

    public String getCode() { return projectCode; }
    public void setCode(String code) { this.projectCode = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getProjectName() { return name; }
    public void setProjectName(String projectName) { this.name = projectName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getObjectives() { return objectives; }
    public void setObjectives(String objectives) { this.objectives = objectives; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getOriginalDeadline() { return originalDeadline; }
    public void setOriginalDeadline(LocalDate originalDeadline) { this.originalDeadline = originalDeadline; }

    public LocalDate getCurrentDeadline() { return currentDeadline; }
    public void setCurrentDeadline(LocalDate currentDeadline) { this.currentDeadline = currentDeadline; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getCreatedByHrId() { return createdByHrId; }
    public void setCreatedByHrId(Long createdByHrId) { this.createdByHrId = createdByHrId; }

    public String getCreatedByHrName() { return createdByHrName; }
    public void setCreatedByHrName(String createdByHrName) { this.createdByHrName = createdByHrName; }

    public int getTotalTasks() { return totalTasks; }
    public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }

    public int getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(int completedTasks) { this.completedTasks = completedTasks; }

    public int getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(int completionPercentage) { this.completionPercentage = completionPercentage; }

    public int getMemberCount() { return memberCount; }
    public void setMemberCount(int memberCount) { this.memberCount = memberCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
