package com.groupmeet.application.dto;

import com.groupmeet.application.model.MeetingFormat;
import java.time.LocalDateTime;
import java.util.List;

public class MeetingDetailDto {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime dateTime;
    private String location;
    private MeetingFormat format;
    private List<String> meetingTypeNames;
    private MeetingParticipantPreviewDto organizer;
    private List<MeetingParticipantPreviewDto> participantsPreview;
    private int totalParticipants;
    private Integer maxParticipants;
    private CurrentUserMeetingMembership currentUserMembership;
    private boolean isCurrentUserOrganizer;
    private long participantCount;

    public MeetingDetailDto() {}

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
    public MeetingFormat getFormat() { return format; }
    public void setFormat(MeetingFormat format) { this.format = format; }
    public List<String> getMeetingTypeNames() { return meetingTypeNames; }
    public void setMeetingTypeNames(List<String> meetingTypeNames) { this.meetingTypeNames = meetingTypeNames; }
    public MeetingParticipantPreviewDto getOrganizer() { return organizer; }
    public void setOrganizer(MeetingParticipantPreviewDto organizer) { this.organizer = organizer; }
    public List<MeetingParticipantPreviewDto> getParticipantsPreview() { return participantsPreview; }
    public void setParticipantsPreview(List<MeetingParticipantPreviewDto> participantsPreview) { this.participantsPreview = participantsPreview; }
    public int getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(int totalParticipants) { this.totalParticipants = totalParticipants; }
    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
    public CurrentUserMeetingMembership getCurrentUserMembership() { return currentUserMembership; }
    public void setCurrentUserMembership(CurrentUserMeetingMembership currentUserMembership) { this.currentUserMembership = currentUserMembership; }
    public boolean isCurrentUserOrganizer() { return isCurrentUserOrganizer; }
    public void setCurrentUserOrganizer(boolean currentUserOrganizer) { this.isCurrentUserOrganizer = currentUserOrganizer; }
    public long getParticipantCount() { return participantCount; }
    public void setParticipantCount(long participantCount) { this.participantCount = participantCount; }
}
