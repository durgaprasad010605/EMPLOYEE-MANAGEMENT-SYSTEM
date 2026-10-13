package com.employeetracker.repository;

import com.employeetracker.entity.Hr;
import com.employeetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HrRepository extends JpaRepository<Hr, Long> {
    Optional<Hr> findByUser(User user);
    Optional<Hr> findByUserId(Long userId);
}
