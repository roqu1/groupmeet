package com.groupmeet.application.dto;

public class MeetingParticipantPreviewDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private boolean isOrganizer;

    public MeetingParticipantPreviewDto(Long id, String firstName, String lastName, String avatarUrl, boolean isOrganizer) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.avatarUrl = avatarUrl;
        this.isOrganizer = isOrganizer;
    }

    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getAvatarUrl() { return avatarUrl; }
    public boolean isOrganizer() { return isOrganizer; }

    public void setId(Long id) { this.id = id; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public void setOrganizer(boolean organizer) { this.isOrganizer = organizer; }
}