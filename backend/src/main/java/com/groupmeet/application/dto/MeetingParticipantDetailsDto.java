package com.groupmeet.application.dto;

import com.groupmeet.application.model.Gender;
import com.groupmeet.application.model.User;

public class MeetingParticipantDetailsDto {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private Gender gender;
    private boolean isOrganizer;
    private String participationStatus;

    public MeetingParticipantDetailsDto() {}

    public static MeetingParticipantDetailsDto fromUser(User user, boolean isOrganizer, String participationStatus) {
        MeetingParticipantDetailsDto dto = new MeetingParticipantDetailsDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setGender(user.getGender());
        dto.setOrganizer(isOrganizer);
        dto.setParticipationStatus(participationStatus);
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }
    public boolean isOrganizer() { return isOrganizer; }
    public void setOrganizer(boolean organizer) { isOrganizer = organizer; }
    public String getParticipationStatus() { return participationStatus; }
    public void setParticipationStatus(String participationStatus) { this.participationStatus = participationStatus; }
}