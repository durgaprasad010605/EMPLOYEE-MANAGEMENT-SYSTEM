package com.employeetracker.service;

import com.employeetracker.dto.ProgressUpdateDTO;
import com.employeetracker.dto.TaskDTO;
import com.employeetracker.entity.*;
import com.employeetracker.exception.InvalidRequestException;
import com.employeetracker.exception.TaskNotFoundException;
import com.employeetracker.exception.UnauthorizedException;
import com.employeetracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    @Autowired
    private HrRepository hrRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByEmployee(Long employeeId) {
        return taskRepository.findByAssignedEmployeeId(employeeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Task getTaskEntityById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
    }

    public TaskDTO getTaskById(Long id) {
        return toDTO(getTaskEntityById(id));
    }

    @Transactional
    public TaskDTO createTask(Long projectId, TaskDTO dto, Long hrId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new InvalidRequestException("Project not found with id: " + projectId));

        if (dto.getAssignedEmployeeId() == null) {
            throw new InvalidRequestException("An employee must be assigned to the task");
        }

        Employee employee = employeeRepository.findById(dto.getAssignedEmployeeId())
                .orElseThrow(() -> new InvalidRequestException("Assigned employee not found with id: " + dto.getAssignedEmployeeId()));

        // Crucial requirement: Prevent assigning tasks to employees who do not belong to the project
        boolean isMember = projectMemberRepository.existsByProjectAndEmployee(project, employee);
        if (!isMember) {
            throw new InvalidRequestException("Employee " + employee.getFullName() + " is not an active member of project " + project.getName() + ". Add them to the project team first.");
        }

        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new InvalidRequestException("Task title is required");
        }
        if (dto.getStartDate() == null || dto.getDeadline() == null) {
            throw new InvalidRequestException("Task start date and deadline are required");
        }
        if (dto.getDeadline().isBefore(dto.getStartDate())) {
            throw new InvalidRequestException("Task deadline cannot be before start date");
        }

        Hr hr = null;
        if (hrId != null) {
            hr = hrRepository.findById(hrId).orElse(null);
        }
        if (hr == null) {
            hr = hrRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new InvalidRequestException("No HR profile found to record as task creator"));
        }

        Task task = new Task();
        task.setProject(project);
        task.setTitle(dto.getTitle().trim());
        task.setDescription(dto.getDescription());
        task.setAssignedEmployee(employee);
        task.setCreatedByHr(hr);
        task.setPriority(dto.getPriority() != null ? dto.getPriority().toUpperCase().trim() : "MEDIUM");
        task.setStatus(dto.getStatus() != null ? dto.getStatus().toUpperCase().trim() : "TODO");
        task.setStartDate(dto.getStartDate());
        task.setDeadline(dto.getDeadline());
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        Task saved = taskRepository.save(task);

        // Notify assigned employee if user account exists
        if (employee.getUser() != null) {
            notificationRepository.save(new Notification(
                    employee.getUser(),
                    "New Task Assigned",
                    "You have been assigned to task '" + saved.getTitle() + "' in project '" + project.getName() + "'. Deadline: " + saved.getDeadline(),
                    "TASK",
                    saved.getId()
            ));
        }

        return toDTO(saved);
    }

    @Transactional
    public TaskDTO updateTask(Long id, TaskDTO dto) {
        Task task = getTaskEntityById(id);

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            task.setTitle(dto.getTitle().trim());
        }
        if (dto.getDescription() != null) {
            task.setDescription(dto.getDescription());
        }
        if (dto.getPriority() != null && !dto.getPriority().isBlank()) {
            task.setPriority(dto.getPriority().toUpperCase().trim());
        }
        if (dto.getStartDate() != null) {
            task.setStartDate(dto.getStartDate());
        }
        if (dto.getDeadline() != null) {
            task.setDeadline(dto.getDeadline());
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            task.setStatus(dto.getStatus().toUpperCase().trim());
        }

        // If HR reassigns employee, check project membership
        if (dto.getAssignedEmployeeId() != null && !dto.getAssignedEmployeeId().equals(task.getAssignedEmployee().getId())) {
            Employee newEmp = employeeRepository.findById(dto.getAssignedEmployeeId())
                    .orElseThrow(() -> new InvalidRequestException("New assigned employee not found"));
            boolean isMember = projectMemberRepository.existsByProjectAndEmployee(task.getProject(), newEmp);
            if (!isMember) {
                throw new InvalidRequestException("Employee " + newEmp.getFullName() + " is not a member of project " + task.getProject().getName());
            }
            task.setAssignedEmployee(newEmp);
        }

        task.setUpdatedAt(LocalDateTime.now());
        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    @Transactional
    public TaskDTO updateTaskStatus(Long taskId, String status, Long currentEmployeeId, boolean isHr) {
        Task task = getTaskEntityById(taskId);

        if (!isHr) {
            if (currentEmployeeId == null || !task.getAssignedEmployee().getId().equals(currentEmployeeId)) {
                throw new UnauthorizedException("You are not authorized to update this task's status");
            }
        }

        if (status == null || status.isBlank()) {
            throw new InvalidRequestException("Status cannot be empty");
        }

        String validStatus = status.toUpperCase().trim();
        task.setStatus(validStatus);
        task.setUpdatedAt(LocalDateTime.now());

        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    @Transactional
    public ProgressUpdateDTO submitProgress(Long taskId, Long employeeId, ProgressUpdateDTO dto) {
        Task task = getTaskEntityById(taskId);

        // Only the employee assigned to the task may submit progress for that task
        if (employeeId == null || !task.getAssignedEmployee().getId().equals(employeeId)) {
            throw new UnauthorizedException("Only the employee assigned to this task can submit progress updates");
        }

        if (dto.getProgressPercentage() == null || dto.getProgressPercentage() < 0 || dto.getProgressPercentage() > 100) {
            throw new InvalidRequestException("Progress percentage must be between 0 and 100");
        }

        if (dto.getWorkCompleted() == null || dto.getWorkCompleted().isBlank()) {
            throw new InvalidRequestException("Work completed summary is required");
        }

        ProgressUpdate update = new ProgressUpdate();
        update.setTask(task);
        update.setEmployee(task.getAssignedEmployee());
        update.setWorkCompleted(dto.getWorkCompleted().trim());
        update.setRemainingWork(dto.getRemainingWork() != null ? dto.getRemainingWork().trim() : "");
        update.setProgressPercentage(dto.getProgressPercentage());
        update.setBlockers(dto.getBlockers());
        update.setSubmittedAt(LocalDateTime.now());

        ProgressUpdate saved = progressUpdateRepository.save(update);

        // Update task status automatically if 100% or based on progress
        if (dto.getProgressPercentage() == 100) {
            task.setStatus("COMPLETED");
        } else if ("TODO".equalsIgnoreCase(task.getStatus()) && dto.getProgressPercentage() > 0) {
            task.setStatus("IN_PROGRESS");
        }
        if (dto.getBlockers() != null && !dto.getBlockers().isBlank() && !"COMPLETED".equalsIgnoreCase(task.getStatus())) {
            task.setStatus("BLOCKED");
        }
        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(task);

        return ProgressUpdateDTO.fromEntity(saved);
    }

    public List<ProgressUpdateDTO> getProgressForTask(Long taskId) {
        return progressUpdateRepository.findByTaskIdOrderBySubmittedAtDesc(taskId).stream()
                .map(ProgressUpdateDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ProgressUpdateDTO> getProgressForEmployee(Long employeeId) {
        return progressUpdateRepository.findByEmployeeIdOrderBySubmittedAtDesc(employeeId).stream()
                .map(ProgressUpdateDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ProgressUpdateDTO> getProgressForProject(Long projectId) {
        return progressUpdateRepository.findByProjectIdOrderBySubmittedAtDesc(projectId).stream()
                .map(ProgressUpdateDTO::fromEntity)
                .collect(Collectors.toList());
    }

    private TaskDTO toDTO(Task t) {
        if (t == null) return null;
        List<ProgressUpdate> updates = progressUpdateRepository.findByTaskIdOrderBySubmittedAtDesc(t.getId());
        Integer latestProgress = updates.isEmpty() ? null : updates.get(0).getProgressPercentage();
        return TaskDTO.fromEntity(t, latestProgress);
    }
}
