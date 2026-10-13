package com.employeetracker.controller;

import com.employeetracker.dto.ApiResponse;
import com.employeetracker.dto.NotificationDTO;
import com.employeetracker.security.UserPrincipal;
import com.employeetracker.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotifications(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        List<NotificationDTO> list = notificationService.getNotificationsForUser(principal.getId());
        long unreadCount = notificationService.getUnreadCount(principal.getId());

        Map<String, Object> data = new HashMap<>();
        data.put("notifications", list);
        data.put("unreadCount", unreadCount);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id, Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        notificationService.markAsRead(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }
}
