package com.groupmeet.application.dto;

import com.groupmeet.application.model.User;
import java.time.LocalDateTime;

public class FriendRequestDto {
    private Long requestId;
    private Long senderId;
    private String senderUsername;
    private String senderFirstName;
    private String senderLastName;
    private String senderAvatarUrl;
    private LocalDateTime requestDate;

    public FriendRequestDto(Long requestId, User sender, LocalDateTime requestDate) {
        this.requestId = requestId;
        if (sender != null) {
            this.senderId = sender.getId();
            this.senderUsername = sender.getUsername();
            this.senderFirstName = sender.getFirstName();
            this.senderLastName = sender.getLastName();
            this.senderAvatarUrl = sender.getAvatarUrl();
        }
        this.requestDate = requestDate;
    }

    public Long getRequestId() {
        return requestId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public String getSenderUsername() {
        return senderUsername;
    }

    public String getSenderFirstName() {
        return senderFirstName;
    }

    public String getSenderLastName() {
        return senderLastName;
    }

    public String getSenderAvatarUrl() {
        return senderAvatarUrl;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }

    public void setSenderFirstName(String senderFirstName) {
        this.senderFirstName = senderFirstName;
    }

    public void setSenderLastName(String senderLastName) {
        this.senderLastName = senderLastName;
    }

    public void setSenderAvatarUrl(String senderAvatarUrl) {
        this.senderAvatarUrl = senderAvatarUrl;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }
}