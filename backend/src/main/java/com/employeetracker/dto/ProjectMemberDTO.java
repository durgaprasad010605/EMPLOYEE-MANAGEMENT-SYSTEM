package com.employeetracker.dto;

import com.employeetracker.entity.ProjectMember;
import java.time.LocalDateTime;

public class ProjectMemberDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String designation;
    private String email;
    private String phone;
    private String projectRole;
    private LocalDateTime assignedAt;
    private String status;

    public ProjectMemberDTO() {}

    public static ProjectMemberDTO fromEntity(ProjectMember pm) {
        if (pm == null) return null;
        ProjectMemberDTO dto = new ProjectMemberDTO();
        dto.setId(pm.getId());
        if (pm.getProject() != null) {
            dto.setProjectId(pm.getProject().getId());
            dto.setProjectName(pm.getProject().getName());
        }
        if (pm.getEmployee() != null) {
            dto.setEmployeeId(pm.getEmployee().getId());
            dto.setEmployeeCode(pm.getEmployee().getEmployeeCode());
            dto.setEmployeeName(pm.getEmployee().getFullName());
            dto.setDesignation(pm.getEmployee().getDesignation());
            dto.setPhone(pm.getEmployee().getPhone());
            if (pm.getEmployee().getUser() != null) {
                dto.setEmail(pm.getEmployee().getUser().getEmail());
            }
        }
        dto.setProjectRole(pm.getProjectRole());
        dto.setAssignedAt(pm.getAssignedAt());
        dto.setStatus(pm.getStatus());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getProjectRole() { return projectRole; }
    public void setProjectRole(String projectRole) { this.projectRole = projectRole; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
