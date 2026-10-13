package com.employeetracker.repository;

import com.employeetracker.entity.Employee;
import com.employeetracker.entity.Project;
import com.employeetracker.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedEmployee(Employee employee);
    List<Task> findByAssignedEmployeeId(Long employeeId);
    List<Task> findByStatus(String status);
    long countByStatus(String status);
    long countByProject(Project project);
    long countByProjectId(Long projectId);
    long countByProjectAndStatus(Project project, String status);
    long countByProjectIdAndStatus(Long projectId, String status);
    long countByAssignedEmployee(Employee employee);
    long countByAssignedEmployeeAndStatus(Employee employee, String status);
    List<Task> findTop5ByOrderByCreatedAtDesc();
}
