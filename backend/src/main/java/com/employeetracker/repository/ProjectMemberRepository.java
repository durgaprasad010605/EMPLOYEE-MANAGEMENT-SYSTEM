package com.employeetracker.repository;

import com.employeetracker.entity.Employee;
import com.employeetracker.entity.Project;
import com.employeetracker.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProject(Project project);
    List<ProjectMember> findByProjectId(Long projectId);
    List<ProjectMember> findByEmployee(Employee employee);
    List<ProjectMember> findByEmployeeId(Long employeeId);
    Optional<ProjectMember> findByProjectAndEmployee(Project project, Employee employee);
    Optional<ProjectMember> findByProjectIdAndEmployeeId(Long projectId, Long employeeId);
    boolean existsByProjectAndEmployee(Project project, Employee employee);
    boolean existsByProjectIdAndEmployeeId(Long projectId, Long employeeId);
    void deleteByProjectIdAndEmployeeId(Long projectId, Long employeeId);
    long countByProject(Project project);
}
