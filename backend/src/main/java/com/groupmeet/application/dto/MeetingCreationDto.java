package com.groupmeet.application.dto;

import com.groupmeet.application.model.MeetingFormat;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class MeetingCreationDto {

    @NotBlank(message = "Titel ist erforderlich")
    @Size(max = 255, message = "Titel darf maximal 255 Zeichen lang sein")
    private String title;

    private String description;

    @NotNull(message = "Format ist erforderlich")
    private MeetingFormat format;

    @NotEmpty(message = "Mindestens eine Art des Meetings ist erforderlich")
    @Size(min = 1, max = 5, message = "Es können zwischen 1 und 5 Arten ausgewählt werden")
    private List<String> meetingTypeNames;

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

    public List<String> getMeetingTypeNames() {
        return meetingTypeNames;
    }

    public void setMeetingTypeNames(List<String> meetingTypeNames) {
        this.meetingTypeNames = meetingTypeNames;
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