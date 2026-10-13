package com.employeetracker.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress_updates")
public class ProgressUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "work_completed", columnDefinition = "TEXT", nullable = false)
    private String workCompleted;

    @Column(name = "remaining_work", columnDefinition = "TEXT", nullable = false)
    private String remainingWork;

    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage; // 0 to 100

    @Column(columnDefinition = "TEXT")
    private String blockers;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    public ProgressUpdate() {}

    public ProgressUpdate(Task task, Employee employee, String workCompleted, String remainingWork,
                          Integer progressPercentage, String blockers) {
        this.task = task;
        this.employee = employee;
        this.workCompleted = workCompleted;
        this.remainingWork = remainingWork;
        this.progressPercentage = progressPercentage;
        this.blockers = blockers;
        this.submittedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public String getWorkCompleted() { return workCompleted; }
    public void setWorkCompleted(String workCompleted) { this.workCompleted = workCompleted; }

    public String getRemainingWork() { return remainingWork; }
    public void setRemainingWork(String remainingWork) { this.remainingWork = remainingWork; }

    // Backward-compatible alias
    public String getWorkRemaining() { return remainingWork; }
    public void setWorkRemaining(String workRemaining) { this.remainingWork = workRemaining; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public String getBlockers() { return blockers; }
    public void setBlockers(String blockers) { this.blockers = blockers; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getSubmissionTimestamp() { return submittedAt; }
    public void setSubmissionTimestamp(LocalDateTime submissionTimestamp) { this.submittedAt = submissionTimestamp; }
}
