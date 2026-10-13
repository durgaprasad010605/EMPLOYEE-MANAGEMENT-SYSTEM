package com.employeetracker.repository;

import com.employeetracker.entity.Employee;
import com.employeetracker.entity.ProgressUpdate;
import com.employeetracker.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressUpdateRepository extends JpaRepository<ProgressUpdate, Long> {
    List<ProgressUpdate> findByTaskOrderBySubmittedAtDesc(Task task);
    List<ProgressUpdate> findByTaskIdOrderBySubmittedAtDesc(Long taskId);
    List<ProgressUpdate> findByEmployeeOrderBySubmittedAtDesc(Employee employee);
    List<ProgressUpdate> findByEmployeeIdOrderBySubmittedAtDesc(Long employeeId);
    
    @Query("SELECT pu FROM ProgressUpdate pu WHERE pu.task.project.id = :projectId ORDER BY pu.submittedAt DESC")
    List<ProgressUpdate> findByProjectIdOrderBySubmittedAtDesc(@Param("projectId") Long projectId);

    List<ProgressUpdate> findTop5ByOrderBySubmittedAtDesc();
}
