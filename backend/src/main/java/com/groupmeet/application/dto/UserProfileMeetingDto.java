package com.groupmeet.application.dto;

import com.groupmeet.application.model.Interest;
import com.groupmeet.application.model.Meeting;
import com.groupmeet.application.model.MeetingFormat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class UserProfileMeetingDto {
    private Long id;
    private String title;
    private LocalDateTime dateTime;
    private String location;
    private MeetingFormat format;
    private List<String> meetingTypeNames;
    private String status;

    public UserProfileMeetingDto() {}

    public static UserProfileMeetingDto fromEntity(Meeting meeting, String status) {
        UserProfileMeetingDto dto = new UserProfileMeetingDto();
        dto.setId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setDateTime(meeting.getDateTime());
        dto.setLocation(meeting.getLocation());
        dto.setFormat(meeting.getFormat());
        if (meeting.getMeetingTypes() != null && !meeting.getMeetingTypes().isEmpty()) {
            dto.setMeetingTypeNames(
                meeting.getMeetingTypes().stream()
                        .map(Interest::getName)
                        .collect(Collectors.toList())
            );
        } else {
            dto.setMeetingTypeNames(List.of());
        }
        dto.setStatus(status);
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public MeetingFormat getFormat() { return format; }
    public void setFormat(MeetingFormat format) { this.format = format; }
    public List<String> getMeetingTypeNames() { return meetingTypeNames; }
    public void setMeetingTypeNames(List<String> meetingTypeNames) { this.meetingTypeNames = meetingTypeNames; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}