package com.groupmeet.application.repository;

import com.groupmeet.application.model.BlockedMeetingParticipant;
import com.groupmeet.application.model.Meeting;
import com.groupmeet.application.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockedMeetingParticipantRepository extends JpaRepository<BlockedMeetingParticipant, Long> {
    boolean existsByMeetingAndUser(Meeting meeting, User user);
    Optional<BlockedMeetingParticipant> findByMeetingAndUser(Meeting meeting, User user);
    Optional<BlockedMeetingParticipant> findByMeeting_IdAndUser_Id(Long meetingId, Long userId);
    void deleteByMeetingAndUser(Meeting meeting, User user);
    List<BlockedMeetingParticipant> findByMeeting(Meeting meeting);
}