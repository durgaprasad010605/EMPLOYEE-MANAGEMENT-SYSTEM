package com.employeetracker.dto;

import com.employeetracker.entity.Notification;
import java.time.LocalDateTime;

public class NotificationDTO {
    private Long id;
    private Long recipientUserId;
    private String title;
    private String message;
    private String relatedType;
    private Long relatedId;
    private boolean isRead;
    private LocalDateTime createdAt;

    public NotificationDTO() {}

    public static NotificationDTO fromEntity(Notification n) {
        if (n == null) return null;
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        if (n.getRecipientUser() != null) {
            dto.setRecipientUserId(n.getRecipientUser().getId());
        }
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setRelatedType(n.getRelatedType());
        dto.setRelatedId(n.getRelatedId());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(Long recipientUserId) { this.recipientUserId = recipientUserId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRelatedType() { return relatedType; }
    public void setRelatedType(String relatedType) { this.relatedType = relatedType; }

    public Long getRelatedId() { return relatedId; }
    public void setRelatedId(Long relatedId) { this.relatedId = relatedId; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
