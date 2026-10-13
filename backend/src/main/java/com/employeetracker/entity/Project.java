package com.employeetracker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_code", nullable = false, unique = true, length = 50)
    private String projectCode;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String objectives;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "original_deadline", nullable = false)
    private LocalDate originalDeadline;

    @Column(name = "current_deadline", nullable = false)
    private LocalDate currentDeadline;

    @Column(nullable = false, length = 20)
    private String status = "PLANNED"; // PLANNED, ACTIVE, ON_HOLD, COMPLETED, CANCELLED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by_hr_id", nullable = false)
    private Hr createdByHr;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Project() {}

    public Project(String projectCode, String name, String description, String objectives,
                   LocalDate startDate, LocalDate originalDeadline, Hr createdByHr) {
        this.projectCode = projectCode;
        this.name = name;
        this.description = description;
        this.objectives = objectives;
        this.startDate = startDate;
        this.originalDeadline = originalDeadline;
        this.currentDeadline = originalDeadline;
        this.status = "PLANNED";
        this.createdByHr = createdByHr;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }

    // Backward-compatible alias
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

    public LocalDate getCurrentApprovedDeadline() { return currentDeadline; }
    public void setCurrentApprovedDeadline(LocalDate deadline) { this.currentDeadline = deadline; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Hr getCreatedByHr() { return createdByHr; }
    public void setCreatedByHr(Hr createdByHr) { this.createdByHr = createdByHr; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
