package com.groupmeet.application.dto;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * DTO representing a calendar event (meeting) for display in the calendar.
 * This consolidates meeting information into a format suitable for calendar display.
 */
public class CalendarEventDto {
    private Long id;
    private String title;
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateTime;

    private String location;
    private String format; // ONLINE, OFFLINE, HYBRID
    private boolean isOrganizer;
    private int participantCount;

    public CalendarEventDto() {}

    public CalendarEventDto(Long id, String title, String description, LocalDateTime dateTime,
                            String location, String format, boolean isOrganizer, int participantCount) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dateTime = dateTime;
        this.location = location;
        this.format = format;
        this.isOrganizer = isOrganizer;
        this.participantCount = participantCount;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public boolean getIsOrganizer() { return isOrganizer; }
    public void setIsOrganizer(boolean isOrganizer) { this.isOrganizer = isOrganizer; }

    public int getParticipantCount() { return participantCount; }
    public void setParticipantCount(int participantCount) { this.participantCount = participantCount; }
}