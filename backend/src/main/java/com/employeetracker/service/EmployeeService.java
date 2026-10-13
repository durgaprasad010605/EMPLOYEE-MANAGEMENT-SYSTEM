package com.employeetracker.service;

import com.employeetracker.dto.EmployeeDTO;
import com.employeetracker.entity.Employee;
import com.employeetracker.entity.ProjectMember;
import com.employeetracker.entity.Task;
import com.employeetracker.exception.EmployeeNotFoundException;
import com.employeetracker.exception.InvalidRequestException;
import com.employeetracker.repository.EmployeeRepository;
import com.employeetracker.repository.ProgressUpdateRepository;
import com.employeetracker.repository.ProjectMemberRepository;
import com.employeetracker.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    public Page<EmployeeDTO> getAllEmployees(String search, String status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Employee> empPage = employeeRepository.searchEmployees(
                (search != null && !search.trim().isEmpty()) ? search.trim() : null,
                (status != null && !status.trim().isEmpty()) ? status.trim() : null,
                pageable
        );
        return empPage.map(EmployeeDTO::fromEntity);
    }

    public List<EmployeeDTO> getAllEmployeesList() {
        return employeeRepository.findAll().stream()
                .map(EmployeeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Employee getEmployeeEntityById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));
    }

    public EmployeeDTO getEmployeeById(Long id) {
        return EmployeeDTO.fromEntity(getEmployeeEntityById(id));
    }

    public EmployeeDTO getEmployeeByUserId(Long userId) {
        Employee emp = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee profile not found for user ID: " + userId));
        return EmployeeDTO.fromEntity(emp);
    }

    public Map<String, Object> getEmployeeFullProfile(Long id) {
        Employee employee = getEmployeeEntityById(id);

        List<ProjectMember> memberships = projectMemberRepository.findByEmployeeId(id);
        List<Task> tasks = taskRepository.findByAssignedEmployeeId(id);
        var progressUpdates = progressUpdateRepository.findByEmployeeIdOrderBySubmittedAtDesc(id);

        Map<String, Object> profile = new HashMap<>();
        profile.put("employee", EmployeeDTO.fromEntity(employee));
        profile.put("projectMemberships", memberships);
        profile.put("tasks", tasks);
        profile.put("progressUpdates", progressUpdates);

        return profile;
    }

    @Transactional
    public EmployeeDTO createEmployee(EmployeeDTO dto) {
        if (dto.getEmployeeCode() == null || dto.getEmployeeCode().isBlank()) {
            throw new InvalidRequestException("Employee code is required");
        }
        if (employeeRepository.existsByEmployeeCode(dto.getEmployeeCode())) {
            throw new InvalidRequestException("Employee code " + dto.getEmployeeCode() + " already exists");
        }

        Employee emp = new Employee();
        emp.setEmployeeCode(dto.getEmployeeCode().trim());
        emp.setFullName(dto.getFullName() != null ? dto.getFullName().trim() : "");
        emp.setPhone(dto.getPhone());
        emp.setDesignation(dto.getDesignation() != null ? dto.getDesignation().trim() : "Developer");
        emp.setJoiningDate(dto.getJoiningDate() != null ? dto.getJoiningDate() : java.time.LocalDate.now());
        emp.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        emp.setCreatedAt(LocalDateTime.now());

        Employee saved = employeeRepository.save(emp);
        return EmployeeDTO.fromEntity(saved);
    }

    @Transactional
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO updated) {
        Employee employee = getEmployeeEntityById(id);

        if (updated.getFullName() != null && !updated.getFullName().isBlank()) {
            employee.setFullName(updated.getFullName().trim());
        }
        if (updated.getPhone() != null) {
            employee.setPhone(updated.getPhone().trim());
        }
        if (updated.getDesignation() != null && !updated.getDesignation().isBlank()) {
            employee.setDesignation(updated.getDesignation().trim());
        }
        if (updated.getJoiningDate() != null) {
            employee.setJoiningDate(updated.getJoiningDate());
        }
        if (updated.getStatus() != null && !updated.getStatus().isBlank()) {
            employee.setStatus(updated.getStatus().trim());
        }

        Employee saved = employeeRepository.save(employee);
        return EmployeeDTO.fromEntity(saved);
    }

    @Transactional
    public EmployeeDTO updateEmployeeStatus(Long id, String status) {
        Employee employee = getEmployeeEntityById(id);
        if (status == null || status.isBlank()) {
            throw new InvalidRequestException("Status cannot be empty");
        }
        employee.setStatus(status.toUpperCase().trim());
        Employee saved = employeeRepository.save(employee);
        return EmployeeDTO.fromEntity(saved);
    }
}
