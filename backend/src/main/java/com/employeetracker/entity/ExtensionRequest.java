package com.employeetracker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "extension_requests")
public class ExtensionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requested_by_employee_id", nullable = false)
    private Employee requestedByEmployee;

    @Column(name = "current_deadline", nullable = false)
    private LocalDate currentDeadline;

    @Column(name = "requested_deadline", nullable = false)
    private LocalDate requestedDeadline;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewed_by_hr_id")
    private Hr reviewedByHr;

    @Column(name = "hr_response", columnDefinition = "TEXT")
    private String hrResponse;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public ExtensionRequest() {}

    public ExtensionRequest(Project project, Employee requestedByEmployee, LocalDate currentDeadline,
                            LocalDate requestedDeadline, String reason) {
        this.project = project;
        this.requestedByEmployee = requestedByEmployee;
        this.currentDeadline = currentDeadline;
        this.requestedDeadline = requestedDeadline;
        this.reason = reason;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Employee getRequestedByEmployee() { return requestedByEmployee; }
    public void setRequestedByEmployee(Employee requestedByEmployee) { this.requestedByEmployee = requestedByEmployee; }

    // Backward-compatible alias
    public Employee getRequestedBy() { return requestedByEmployee; }
    public void setRequestedBy(Employee requestedBy) { this.requestedByEmployee = requestedBy; }

    public LocalDate getCurrentDeadline() { return currentDeadline; }
    public void setCurrentDeadline(LocalDate currentDeadline) { this.currentDeadline = currentDeadline; }

    public LocalDate getRequestedDeadline() { return requestedDeadline; }
    public void setRequestedDeadline(LocalDate requestedDeadline) { this.requestedDeadline = requestedDeadline; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Hr getReviewedByHr() { return reviewedByHr; }
    public void setReviewedByHr(Hr reviewedByHr) { this.reviewedByHr = reviewedByHr; }

    public String getHrResponse() { return hrResponse; }
    public void setHrResponse(String hrResponse) { this.hrResponse = hrResponse; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
