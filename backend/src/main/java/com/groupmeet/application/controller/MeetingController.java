package com.groupmeet.application.controller;

import com.groupmeet.application.dto.MeetingCreationDto;
import com.groupmeet.application.dto.MeetingDto;
import com.groupmeet.application.dto.MeetingSearchCriteriaDto;
import com.groupmeet.application.service.MeetingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    @Autowired
    private MeetingService meetingService;

    @PostMapping
    public ResponseEntity<MeetingDto> createMeeting(
            @Valid @RequestBody MeetingCreationDto meetingCreationDto,
            @AuthenticationPrincipal UserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            MeetingDto createdMeeting = meetingService.createMeeting(meetingCreationDto, currentUserDetails.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdMeeting);
        } catch (IllegalArgumentException e) {
             return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Page<MeetingDto>> searchMeetings(
            MeetingSearchCriteriaDto criteria,
            @PageableDefault(size = 10, sort = "dateTime", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<MeetingDto> meetings = meetingService.searchMeetings(criteria, pageable);
        return ResponseEntity.ok(meetings);
    }
}