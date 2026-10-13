package com.employeetracker.dto;

import com.employeetracker.entity.Employee;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class EmployeeDTO {
    private Long id;
    private Long userId;
    private String username;
    private String employeeCode;
    private String fullName;
    private String email;
    private String phone;
    private String designation;
    private LocalDate joiningDate;
    private String status;
    private LocalDateTime createdAt;

    public EmployeeDTO() {}

    public static EmployeeDTO fromEntity(Employee emp) {
        if (emp == null) return null;
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(emp.getId());
        if (emp.getUser() != null) {
            dto.setUserId(emp.getUser().getId());
            dto.setUsername(emp.getUser().getUsername());
            dto.setEmail(emp.getUser().getEmail());
        }
        dto.setEmployeeCode(emp.getEmployeeCode());
        dto.setFullName(emp.getFullName());
        dto.setPhone(emp.getPhone());
        dto.setDesignation(emp.getDesignation());
        dto.setJoiningDate(emp.getJoiningDate());
        dto.setStatus(emp.getStatus());
        dto.setCreatedAt(emp.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
