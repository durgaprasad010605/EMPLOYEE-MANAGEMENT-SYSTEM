package com.employeetracker.service;

import com.employeetracker.dto.LeaveRequestDTO;
import com.employeetracker.entity.*;
import com.employeetracker.exception.InvalidRequestException;
import com.employeetracker.exception.LeaveNotFoundException;
import com.employeetracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private HrRepository hrRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public List<LeaveRequestDTO> getAllLeaves(String status) {
        List<LeaveRequest> list;
        if (status != null && !status.isBlank()) {
            list = leaveRequestRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase().trim());
        } else {
            list = leaveRequestRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(LeaveRequestDTO::fromEntity).collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getEmployeeLeaves(Long employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(LeaveRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestDTO applyLeave(Long employeeId, LeaveRequestDTO dto) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new InvalidRequestException("Employee not found with id: " + employeeId));

        if (dto.getStartDate() == null || dto.getEndDate() == null) {
            throw new InvalidRequestException("Leave start date and end date are required");
        }

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new InvalidRequestException("End date cannot be before start date");
        }

        if (dto.getReason() == null || dto.getReason().isBlank()) {
            throw new InvalidRequestException("Reason for leave is required");
        }

        String type = dto.getLeaveType() != null ? dto.getLeaveType().toUpperCase().trim() : "CASUAL";
        if (!List.of("CASUAL", "SICK", "PERSONAL", "EMERGENCY").contains(type)) {
            type = "CASUAL";
        }

        LeaveRequest lr = new LeaveRequest();
        lr.setEmployee(employee);
        lr.setLeaveType(type);
        lr.setStartDate(dto.getStartDate());
        lr.setEndDate(dto.getEndDate());
        lr.setReason(dto.getReason().trim());
        lr.setStatus("PENDING");
        lr.setCreatedAt(LocalDateTime.now());

        LeaveRequest saved = leaveRequestRepository.save(lr);

        // Notify HR
        List<Hr> hrList = hrRepository.findAll();
        for (Hr hr : hrList) {
            if (hr.getUser() != null) {
                notificationRepository.save(new Notification(
                        hr.getUser(),
                        "New Leave Application",
                        employee.getFullName() + " applied for " + type + " leave from " + dto.getStartDate() + " to " + dto.getEndDate(),
                        "LEAVE",
                        saved.getId()
                ));
            }
        }

        return LeaveRequestDTO.fromEntity(saved);
    }

    @Transactional
    public LeaveRequestDTO reviewLeave(Long leaveId, Long hrId, String decision, String hrResponse) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new LeaveNotFoundException("Leave request not found with id: " + leaveId));

        if (!"PENDING".equalsIgnoreCase(leave.getStatus())) {
            throw new InvalidRequestException("This leave request has already been reviewed (Status: " + leave.getStatus() + ")");
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

        leave.setStatus(validDecision);
        leave.setReviewedByHr(hr);
        leave.setHrResponse(hrResponse != null ? hrResponse.trim() : "");
        leave.setReviewedAt(LocalDateTime.now());

        LeaveRequest saved = leaveRequestRepository.save(leave);

        // Notify employee
        if (leave.getEmployee() != null && leave.getEmployee().getUser() != null) {
            String msg = "Your " + leave.getLeaveType() + " leave application was " + validDecision.toLowerCase() + ".";
            if (hrResponse != null && !hrResponse.isBlank()) {
                msg += " HR response: " + hrResponse;
            }
            notificationRepository.save(new Notification(
                    leave.getEmployee().getUser(),
                    "Leave Request " + validDecision,
                    msg,
                    "LEAVE",
                    saved.getId()
            ));
        }

        return LeaveRequestDTO.fromEntity(saved);
    }
}
