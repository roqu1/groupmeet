package com.groupmeet.application.dto;

import com.groupmeet.application.model.MeetingFormat;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class MeetingCreationDto {

    @NotBlank(message = "Titel ist erforderlich")
    @Size(max = 255, message = "Titel darf maximal 255 Zeichen lang sein")
    private String title;

    private String description;

    @NotNull(message = "Format ist erforderlich")
    private MeetingFormat format;

    @NotBlank(message = "Art des Meetings ist erforderlich")
    private String meetingTypeName;

    @Size(max = 255, message = "Ort darf maximal 255 Zeichen lang sein")
    private String location;

    @NotNull(message = "Datum und Uhrzeit sind erforderlich")
    @Future(message = "Datum und Uhrzeit müssen in der Zukunft liegen")
    private LocalDateTime dateTime;

    @Min(value = 1, message = "Maximale Teilnehmerzahl muss mindestens 1 sein, wenn angegeben")
    private Integer maxParticipants;

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

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }
}