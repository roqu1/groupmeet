package com.groupmeet.application.repository;

import com.groupmeet.application.model.Meeting;
import com.groupmeet.application.model.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long>, JpaSpecificationExecutor<Meeting> {

     @Query("SELECT m FROM Meeting m JOIN m.participants p WHERE p = :user ORDER BY m.dateTime ASC")
    Page<Meeting> findMeetingsByParticipantOrderByDateTimeAsc(@Param("user") User user, Pageable pageable);

}