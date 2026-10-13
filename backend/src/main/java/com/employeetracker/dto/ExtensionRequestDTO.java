package com.employeetracker.dto;

import com.employeetracker.entity.ExtensionRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExtensionRequestDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private String projectCode;
    private Long requestedByEmployeeId;
    private String requestedByEmployeeName;
    private String requestedByEmployeeCode;
    private LocalDate currentDeadline;
    private LocalDate requestedDeadline;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED
    private Long reviewedByHrId;
    private String reviewedByHrName;
    private String hrResponse;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    public ExtensionRequestDTO() {}

    public static ExtensionRequestDTO fromEntity(ExtensionRequest er) {
        if (er == null) return null;
        ExtensionRequestDTO dto = new ExtensionRequestDTO();
        dto.setId(er.getId());
        if (er.getProject() != null) {
            dto.setProjectId(er.getProject().getId());
            dto.setProjectName(er.getProject().getName());
            dto.setProjectCode(er.getProject().getProjectCode());
        }
        if (er.getRequestedByEmployee() != null) {
            dto.setRequestedByEmployeeId(er.getRequestedByEmployee().getId());
            dto.setRequestedByEmployeeName(er.getRequestedByEmployee().getFullName());
            dto.setRequestedByEmployeeCode(er.getRequestedByEmployee().getEmployeeCode());
        }
        dto.setCurrentDeadline(er.getCurrentDeadline());
        dto.setRequestedDeadline(er.getRequestedDeadline());
        dto.setReason(er.getReason());
        dto.setStatus(er.getStatus());
        if (er.getReviewedByHr() != null) {
            dto.setReviewedByHrId(er.getReviewedByHr().getId());
            dto.setReviewedByHrName(er.getReviewedByHr().getFullName());
        }
        dto.setHrResponse(er.getHrResponse());
        dto.setCreatedAt(er.getCreatedAt());
        dto.setReviewedAt(er.getReviewedAt());
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

    public Long getRequestedByEmployeeId() { return requestedByEmployeeId; }
    public void setRequestedByEmployeeId(Long requestedByEmployeeId) { this.requestedByEmployeeId = requestedByEmployeeId; }

    public String getRequestedByEmployeeName() { return requestedByEmployeeName; }
    public void setRequestedByEmployeeName(String requestedByEmployeeName) { this.requestedByEmployeeName = requestedByEmployeeName; }

    public String getRequestedByEmployeeCode() { return requestedByEmployeeCode; }
    public void setRequestedByEmployeeCode(String requestedByEmployeeCode) { this.requestedByEmployeeCode = requestedByEmployeeCode; }

    public LocalDate getCurrentDeadline() { return currentDeadline; }
    public void setCurrentDeadline(LocalDate currentDeadline) { this.currentDeadline = currentDeadline; }

    public LocalDate getRequestedDeadline() { return requestedDeadline; }
    public void setRequestedDeadline(LocalDate requestedDeadline) { this.requestedDeadline = requestedDeadline; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getReviewedByHrId() { return reviewedByHrId; }
    public void setReviewedByHrId(Long reviewedByHrId) { this.reviewedByHrId = reviewedByHrId; }

    public String getReviewedByHrName() { return reviewedByHrName; }
    public void setReviewedByHrName(String reviewedByHrName) { this.reviewedByHrName = reviewedByHrName; }

    public String getHrResponse() { return hrResponse; }
    public void setHrResponse(String hrResponse) { this.hrResponse = hrResponse; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
