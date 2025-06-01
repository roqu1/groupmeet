package com.groupmeet.application.dto;

import org.springframework.data.domain.Page;

public class MeetingParticipantsPageDto {
    private Page<MeetingParticipantDetailsDto> participantsPage;
    private boolean isCurrentUserOrganizer;
    private String groupName;

    public MeetingParticipantsPageDto(
            Page<MeetingParticipantDetailsDto> participantsPage,
            boolean isCurrentUserOrganizer,
            String groupName) {
        this.participantsPage = participantsPage;
        this.isCurrentUserOrganizer = isCurrentUserOrganizer;
        this.groupName = groupName;
    }

    public Page<MeetingParticipantDetailsDto> getParticipantsPage() {
        return participantsPage;
    }

    public void setParticipantsPage(Page<MeetingParticipantDetailsDto> participantsPage) {
        this.participantsPage = participantsPage;
    }

    public boolean isCurrentUserOrganizer() {
        return isCurrentUserOrganizer;
    }

    public void setCurrentUserOrganizer(boolean currentUserOrganizer) {
        isCurrentUserOrganizer = currentUserOrganizer;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }
}