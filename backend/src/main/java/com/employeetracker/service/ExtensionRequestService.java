package com.employeetracker.service;

import com.employeetracker.dto.ExtensionRequestDTO;
import com.employeetracker.entity.*;
import com.employeetracker.exception.InvalidRequestException;
import com.employeetracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExtensionRequestService {

    @Autowired
    private ExtensionRequestRepository extensionRequestRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private HrRepository hrRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public List<ExtensionRequestDTO> getAllRequests(String status) {
        List<ExtensionRequest> list;
        if (status != null && !status.isBlank()) {
            list = extensionRequestRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase().trim());
        } else {
            list = extensionRequestRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(ExtensionRequestDTO::fromEntity).collect(Collectors.toList());
    }

    public List<ExtensionRequestDTO> getEmployeeRequests(Long employeeId) {
        return extensionRequestRepository.findByRequestedByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(ExtensionRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExtensionRequestDTO requestExtension(Long projectId, Long employeeId, LocalDate requestedDeadline, String reason) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new InvalidRequestException("Project not found with id: " + projectId));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new InvalidRequestException("Employee not found with id: " + employeeId));

        // Employees may request extensions only for projects they belong to
        boolean isMember = projectMemberRepository.existsByProjectAndEmployee(project, employee);
        if (!isMember) {
            throw new InvalidRequestException("You can only request deadline extensions for projects you are assigned to");
        }

        if (requestedDeadline == null) {
            throw new InvalidRequestException("Requested deadline date is required");
        }

        if (!requestedDeadline.isAfter(project.getCurrentDeadline())) {
            throw new InvalidRequestException("Requested deadline must be after the current deadline (" + project.getCurrentDeadline() + ")");
        }

        if (reason == null || reason.isBlank()) {
            throw new InvalidRequestException("Reason for extension is required");
        }

        // Prevent duplicate pending requests
        if (extensionRequestRepository.existsByProjectIdAndRequestedByEmployeeIdAndStatus(projectId, employeeId, "PENDING")) {
            throw new InvalidRequestException("You already have a pending extension request for this project");
        }

        ExtensionRequest req = new ExtensionRequest();
        req.setProject(project);
        req.setRequestedByEmployee(employee);
        req.setCurrentDeadline(project.getCurrentDeadline());
        req.setRequestedDeadline(requestedDeadline);
        req.setReason(reason.trim());
        req.setStatus("PENDING");
        req.setCreatedAt(LocalDateTime.now());

        ExtensionRequest saved = extensionRequestRepository.save(req);

        // Notify HR users
        if (project.getCreatedByHr() != null && project.getCreatedByHr().getUser() != null) {
            notificationRepository.save(new Notification(
                    project.getCreatedByHr().getUser(),
                    "New Extension Request",
                    employee.getFullName() + " requested extension for project '" + project.getName() + "' until " + requestedDeadline,
                    "EXTENSION",
                    saved.getId()
            ));
        }

        return ExtensionRequestDTO.fromEntity(saved);
    }

    @Transactional
    public ExtensionRequestDTO reviewExtension(Long id, Long hrId, String decision, String hrResponse) {
        ExtensionRequest req = extensionRequestRepository.findById(id)
                .orElseThrow(() -> new InvalidRequestException("Extension request not found with id: " + id));

        if (!"PENDING".equalsIgnoreCase(req.getStatus())) {
            throw new InvalidRequestException("This request has already been reviewed (Status: " + req.getStatus() + ")");
        }

        String validDecision = decision != null ? decision.toUpperCase().trim() : "";
        if (!"APPROVED".equals(validDecision) && !"REJECTED".equals(validDecision)) {
            throw new InvalidRequestException("Decision must be APPROVED or REJECTED");
        }

        Hr hr = null;
        if (hrId != null) {
            hr = hrRepository.findById(hrId).orElse(null);
        }
        if (hr == null) {
            hr = hrRepository.findAll().stream().findFirst().orElse(null);
        }

        req.setStatus(validDecision);
        req.setReviewedByHr(hr);
        req.setHrResponse(hrResponse != null ? hrResponse.trim() : "");
        req.setReviewedAt(LocalDateTime.now());

        if ("APPROVED".equals(validDecision)) {
            // Transactional update: updates current deadline while preserving original deadline!
            Project project = req.getProject();
            project.setCurrentDeadline(req.getRequestedDeadline());
            project.setUpdatedAt(LocalDateTime.now());
            projectRepository.save(project);
        }

        ExtensionRequest saved = extensionRequestRepository.save(req);

        // Notify employee
        if (req.getRequestedByEmployee() != null && req.getRequestedByEmployee().getUser() != null) {
            String msg = "Your extension request for project '" + req.getProject().getName() + "' was " + validDecision.toLowerCase() + ".";
            if (hrResponse != null && !hrResponse.isBlank()) {
                msg += " HR response: " + hrResponse;
            }
            notificationRepository.save(new Notification(
                    req.getRequestedByEmployee().getUser(),
                    "Extension Request " + validDecision,
                    msg,
                    "EXTENSION",
                    saved.getId()
            ));
        }

        return ExtensionRequestDTO.fromEntity(saved);
    }
}
