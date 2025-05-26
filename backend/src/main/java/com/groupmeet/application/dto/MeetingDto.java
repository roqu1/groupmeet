package com.groupmeet.application.dto;

import com.groupmeet.application.model.Meeting;
import com.groupmeet.application.model.MeetingFormat;

import java.time.LocalDateTime;

public class MeetingDto {
    private Long id;
    private String title;
    private String description;
    private MeetingFormat format;
    private String meetingTypeName;
    private String location;
    private LocalDateTime dateTime;
    private int participantCount;
    private Integer maxParticipants;
    private String creatorUsername;
    private LocalDateTime createdAt;

    public MeetingDto() {
    }

    public static MeetingDto fromEntity(Meeting meeting) {
        MeetingDto dto = new MeetingDto();
        dto.setId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setDescription(meeting.getDescription());
        dto.setFormat(meeting.getFormat());
        if (meeting.getMeetingType() != null) {
            dto.setMeetingTypeName(meeting.getMeetingType().getName());
        }
        dto.setLocation(meeting.getLocation());
        dto.setDateTime(meeting.getDateTime());
        dto.setParticipantCount(meeting.getParticipants() != null ? meeting.getParticipants().size() : 0);
        dto.setMaxParticipants(meeting.getMaxParticipants());
        if (meeting.getCreator() != null) {
            dto.setCreatorUsername(meeting.getCreator().getUsername());
        }
        dto.setCreatedAt(meeting.getCreatedAt());
        return dto;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public MeetingFormat getFormat() {
        return format;
    }

    public void setFormat(MeetingFormat format) {
        this.format = format;
    }

    public String getMeetingTypeName() {
        return meetingTypeName;
    }

    public void setMeetingTypeName(String meetingTypeName) {
        this.meetingTypeName = meetingTypeName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public int getParticipantCount() {
        return participantCount;
    }

    public void setParticipantCount(int participantCount) {
        this.participantCount = participantCount;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public String getCreatorUsername() {
        return creatorUsername;
    }

    public void setCreatorUsername(String creatorUsername) {
        this.creatorUsername = creatorUsername;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}