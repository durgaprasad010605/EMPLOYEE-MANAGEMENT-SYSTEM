package com.employeetracker.dto;

import com.employeetracker.entity.ProgressUpdate;
import java.time.LocalDateTime;

public class ProgressUpdateDTO {
    private Long id;
    private Long taskId;
    private String taskTitle;
    private Long projectId;
    private String projectName;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String workCompleted;
    private String remainingWork;
    private Integer progressPercentage;
    private String blockers;
    private LocalDateTime submittedAt;

    public ProgressUpdateDTO() {}

    public static ProgressUpdateDTO fromEntity(ProgressUpdate pu) {
        if (pu == null) return null;
        ProgressUpdateDTO dto = new ProgressUpdateDTO();
        dto.setId(pu.getId());
        if (pu.getTask() != null) {
            dto.setTaskId(pu.getTask().getId());
            dto.setTaskTitle(pu.getTask().getTitle());
            if (pu.getTask().getProject() != null) {
                dto.setProjectId(pu.getTask().getProject().getId());
                dto.setProjectName(pu.getTask().getProject().getName());
            }
        }
        if (pu.getEmployee() != null) {
            dto.setEmployeeId(pu.getEmployee().getId());
            dto.setEmployeeName(pu.getEmployee().getFullName());
            dto.setEmployeeCode(pu.getEmployee().getEmployeeCode());
        }
        dto.setWorkCompleted(pu.getWorkCompleted());
        dto.setRemainingWork(pu.getRemainingWork());
        dto.setProgressPercentage(pu.getProgressPercentage());
        dto.setBlockers(pu.getBlockers());
        dto.setSubmittedAt(pu.getSubmittedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public String getTaskTitle() { return taskTitle; }
    public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getWorkCompleted() { return workCompleted; }
    public void setWorkCompleted(String workCompleted) { this.workCompleted = workCompleted; }

    public String getRemainingWork() { return remainingWork; }
    public void setRemainingWork(String remainingWork) { this.remainingWork = remainingWork; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public String getBlockers() { return blockers; }
    public void setBlockers(String blockers) { this.blockers = blockers; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
