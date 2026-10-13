package com.employeetracker.repository;

import com.employeetracker.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectCode(String projectCode);
    boolean existsByProjectCode(String projectCode);
    List<Project> findByStatus(String status);
    long countByStatus(String status);
    List<Project> findTop5ByOrderByCreatedAtDesc();
}
