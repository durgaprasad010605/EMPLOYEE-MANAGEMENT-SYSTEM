package com.employeetracker.repository;

import com.employeetracker.entity.Employee;
import com.employeetracker.entity.ExtensionRequest;
import com.employeetracker.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExtensionRequestRepository extends JpaRepository<ExtensionRequest, Long> {
    List<ExtensionRequest> findByProject(Project project);
    List<ExtensionRequest> findByRequestedByEmployee(Employee employee);
    List<ExtensionRequest> findByRequestedByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    List<ExtensionRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<ExtensionRequest> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
    long countByRequestedByEmployeeAndStatus(Employee employee, String status);
    boolean existsByProjectIdAndRequestedByEmployeeIdAndStatus(Long projectId, Long employeeId, String status);
}
