package com.employeetracker.service;

import com.employeetracker.dto.ProjectDTO;
import com.employeetracker.dto.ProjectMemberDTO;
import com.employeetracker.entity.*;
import com.employeetracker.exception.InvalidRequestException;
import com.employeetracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private HrRepository hrRepository;

    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO> getProjectsForEmployee(Long employeeId) {
        List<ProjectMember> memberships = projectMemberRepository.findByEmployeeId(employeeId);
        return memberships.stream()
                .map(pm -> toDTO(pm.getProject()))
                .distinct()
                .collect(Collectors.toList());
    }

    public Project getProjectEntityById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new InvalidRequestException("Project not found with id: " + id));
    }

    public ProjectDTO getProjectById(Long id) {
        return toDTO(getProjectEntityById(id));
    }

    @Transactional
    public ProjectDTO createProject(ProjectDTO dto, Long hrId) {
        if (dto.getProjectCode() == null || dto.getProjectCode().isBlank()) {
            throw new InvalidRequestException("Project code is required");
        }
        if (projectRepository.existsByProjectCode(dto.getProjectCode())) {
            throw new InvalidRequestException("Project code already exists: " + dto.getProjectCode());
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new InvalidRequestException("Project name is required");
        }
        if (dto.getStartDate() == null || dto.getOriginalDeadline() == null) {
            throw new InvalidRequestException("Start date and deadline are required");
        }
        if (dto.getOriginalDeadline().isBefore(dto.getStartDate())) {
            throw new InvalidRequestException("Deadline cannot be before start date");
        }

        Hr hr = null;
        if (hrId != null) {
            hr = hrRepository.findById(hrId).orElse(null);
        }
        if (hr == null) {
            hr = hrRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new InvalidRequestException("No HR profile found to associate as creator"));
        }

        Project p = new Project();
        p.setProjectCode(dto.getProjectCode().trim());
        p.setName(dto.getName().trim());
        p.setDescription(dto.getDescription());
        p.setObjectives(dto.getObjectives());
        p.setStartDate(dto.getStartDate());
        p.setOriginalDeadline(dto.getOriginalDeadline());
        p.setCurrentDeadline(dto.getOriginalDeadline()); // preserved original
        p.setStatus(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "PLANNED");
        p.setCreatedByHr(hr);
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());

        Project saved = projectRepository.save(p);
        return toDTO(saved);
    }

    @Transactional
    public ProjectDTO updateProject(Long id, ProjectDTO dto) {
        Project p = getProjectEntityById(id);

        if (dto.getName() != null && !dto.getName().isBlank()) {
            p.setName(dto.getName().trim());
        }
        if (dto.getDescription() != null) {
            p.setDescription(dto.getDescription());
        }
        if (dto.getObjectives() != null) {
            p.setObjectives(dto.getObjectives());
        }
        if (dto.getStartDate() != null) {
            p.setStartDate(dto.getStartDate());
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            p.setStatus(dto.getStatus().toUpperCase().trim());
        }
        p.setUpdatedAt(LocalDateTime.now());

        Project saved = projectRepository.save(p);
        return toDTO(saved);
    }

    public List<ProjectMemberDTO> getProjectMembers(Long projectId) {
        Project p = getProjectEntityById(projectId);
        return projectMemberRepository.findByProject(p).stream()
                .map(ProjectMemberDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectMemberDTO addProjectMember(Long projectId, Long employeeId, String projectRole) {
        Project project = getProjectEntityById(projectId);
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new InvalidRequestException("Employee not found with id: " + employeeId));

        if (projectMemberRepository.existsByProjectAndEmployee(project, employee)) {
            throw new InvalidRequestException("Employee " + employee.getFullName() + " is already a member of this project");
        }

        String role = (projectRole != null && !projectRole.isBlank()) ? projectRole.trim() : "Developer";
        ProjectMember member = new ProjectMember(project, employee, role);
        ProjectMember saved = projectMemberRepository.save(member);
        return ProjectMemberDTO.fromEntity(saved);
    }

    @Transactional
    public void removeProjectMember(Long projectId, Long employeeId) {
        Project project = getProjectEntityById(projectId);
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new InvalidRequestException("Employee not found with id: " + employeeId));

        // Safety check: ensure active incomplete tasks are not orphaned silently
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        boolean hasActiveIncompleteTasks = tasks.stream()
                .anyMatch(t -> t.getAssignedEmployee() != null &&
                               t.getAssignedEmployee().getId().equals(employeeId) &&
                               !"COMPLETED".equalsIgnoreCase(t.getStatus()));

        if (hasActiveIncompleteTasks) {
            throw new InvalidRequestException("Cannot remove employee while they have active, incomplete tasks on this project. Please reassign or complete tasks first.");
        }

        projectMemberRepository.deleteByProjectIdAndEmployeeId(projectId, employeeId);
    }

    private ProjectDTO toDTO(Project p) {
        if (p == null) return null;
        int totalTasks = (int) taskRepository.countByProjectId(p.getId());
        int completedTasks = (int) taskRepository.countByProjectIdAndStatus(p.getId(), "COMPLETED");
        int memberCount = (int) projectMemberRepository.countByProject(p);
        return ProjectDTO.fromEntity(p, totalTasks, completedTasks, memberCount);
    }
}
