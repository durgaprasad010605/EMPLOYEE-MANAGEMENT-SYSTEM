package com.employeetracker.dto;

import com.employeetracker.entity.LeaveRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LeaveRequestDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String designation;
    private String leaveType; // CASUAL, SICK, PERSONAL, EMERGENCY
    private LocalDate startDate;
    private LocalDate endDate;
    private int days;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED
    private Long reviewedByHrId;
    private String reviewedByHrName;
    private String hrResponse;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    public LeaveRequestDTO() {}

    public static LeaveRequestDTO fromEntity(LeaveRequest lr) {
        if (lr == null) return null;
        LeaveRequestDTO dto = new LeaveRequestDTO();
        dto.setId(lr.getId());
        if (lr.getEmployee() != null) {
            dto.setEmployeeId(lr.getEmployee().getId());
            dto.setEmployeeName(lr.getEmployee().getFullName());
            dto.setEmployeeCode(lr.getEmployee().getEmployeeCode());
            dto.setDesignation(lr.getEmployee().getDesignation());
        }
        dto.setLeaveType(lr.getLeaveType());
        dto.setStartDate(lr.getStartDate());
        dto.setEndDate(lr.getEndDate());
        if (lr.getStartDate() != null && lr.getEndDate() != null) {
            long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(lr.getStartDate(), lr.getEndDate()) + 1;
            dto.setDays((int) Math.max(1, daysDiff));
        }
        dto.setReason(lr.getReason());
        dto.setStatus(lr.getStatus());
        if (lr.getReviewedByHr() != null) {
            dto.setReviewedByHrId(lr.getReviewedByHr().getId());
            dto.setReviewedByHrName(lr.getReviewedByHr().getFullName());
        }
        dto.setHrResponse(lr.getHrResponse());
        dto.setCreatedAt(lr.getCreatedAt());
        dto.setReviewedAt(lr.getReviewedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getLeaveType() { return leaveType; }
    public void setLeaveType(String leaveType) { this.leaveType = leaveType; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }

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
