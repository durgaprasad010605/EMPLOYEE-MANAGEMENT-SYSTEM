package com.employeetracker.repository;

import com.employeetracker.entity.Employee;
import com.employeetracker.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByUser(User user);

    Optional<Employee> findByUserId(Long userId);

    Optional<Employee> findByEmployeeCode(String employeeCode);

    boolean existsByEmployeeCode(String employeeCode);

    List<Employee> findByStatus(String status);

    long countByStatus(String status);

    @Query("SELECT e FROM Employee e WHERE " +
           "(:search IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.designation) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " (e.user IS NOT NULL AND LOWER(e.user.email) LIKE LOWER(CONCAT('%', :search, '%')))) AND " +
           "(:status IS NULL OR e.status = :status)")
    Page<Employee> searchEmployees(@Param("search") String search,
                                   @Param("status") String status,
                                   Pageable pageable);
}
