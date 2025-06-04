package com.groupmeet.application.controller;

import com.groupmeet.application.controller.AuthController.MessageResponse;
import com.groupmeet.application.dto.MeetingCreationDto;
import com.groupmeet.application.dto.MeetingDetailDto;
import com.groupmeet.application.dto.MeetingDto;
import com.groupmeet.application.dto.MeetingParticipantsPageDto;
import com.groupmeet.application.dto.MeetingSearchCriteriaDto;
import com.groupmeet.application.dto.MeetingUpdateDto;
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
import org.springframework.web.server.ResponseStatusException;

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
 @GetMapping("/{meetingId}")
    public ResponseEntity<MeetingDetailDto> getMeetingById(
            @PathVariable Long meetingId,
            @AuthenticationPrincipal UserDetails currentUserDetails) {
        try {
            String currentUsername = (currentUserDetails != null) ? currentUserDetails.getUsername() : null;
            MeetingDetailDto meetingDetailDto = meetingService.getMeetingDetailsById(meetingId, currentUsername);
            return ResponseEntity.ok(meetingDetailDto);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(null); 
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PostMapping("/{meetingId}/join")
    public ResponseEntity<?> joinMeeting(
            @PathVariable Long meetingId,
            @AuthenticationPrincipal UserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            meetingService.joinMeeting(meetingId, currentUserDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Erfolgreich dem Meeting beigetreten."));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new AuthController.ErrorResponse(e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Fehler beim Beitreten zum Meeting."));
        }
    }

    @PostMapping("/{meetingId}/leave")
    public ResponseEntity<?> leaveMeeting(
            @PathVariable Long meetingId,
            @AuthenticationPrincipal UserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            meetingService.leaveMeeting(meetingId, currentUserDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Meeting erfolgreich verlassen."));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new AuthController.ErrorResponse(e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Fehler beim Verlassen des Meetings."));
        }
    }

    @PostMapping("/{meetingId}/participants/{userId}/block")
    public ResponseEntity<?> blockMeetingParticipant(
            @PathVariable Long meetingId,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            meetingService.blockParticipant(meetingId, userId, currentUserDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Benutzer erfolgreich für das Meeting blockiert."));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new AuthController.ErrorResponse(e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Fehler beim Blockieren des Teilnehmers."));
        }
    }

    @DeleteMapping("/{meetingId}/participants/{userId}/block")
    public ResponseEntity<?> unblockMeetingParticipant(
            @PathVariable Long meetingId,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            meetingService.unblockParticipant(meetingId, userId, currentUserDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Blockierung des Benutzers für das Meeting erfolgreich aufgehoben."));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new AuthController.ErrorResponse(e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Fehler beim Aufheben der Blockierung des Teilnehmers."));
        }
    }

    @DeleteMapping("/{meetingId}/participants/{userId}/remove")
    public ResponseEntity<?> removeMeetingParticipant(
            @PathVariable Long meetingId,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            meetingService.removeParticipantFromMeeting(meetingId, userId, currentUserDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Teilnehmer erfolgreich aus dem Meeting entfernt."));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new AuthController.ErrorResponse(e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Fehler beim Entfernen des Teilnehmers."));
        }
    }

    @GetMapping("/{meetingId}/participants-details")
    public ResponseEntity<MeetingParticipantsPageDto> getMeetingParticipantsDetailed(
            @PathVariable Long meetingId,
            @RequestParam(required = false) String searchTerm,
            @PageableDefault(size = 15) Pageable pageable,
            @AuthenticationPrincipal UserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            MeetingParticipantsPageDto participantsData = meetingService.getMeetingParticipantsDetails(
                    meetingId, currentUserDetails.getUsername(), pageable, searchTerm);
            return ResponseEntity.ok(participantsData);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(null);
        }
    }

    @DeleteMapping("/{meetingId}")
    public ResponseEntity<?> deleteMeeting(
            @PathVariable Long meetingId,
            @AuthenticationPrincipal UserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            meetingService.deleteMeeting(meetingId, currentUserDetails.getUsername());
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new AuthController.ErrorResponse(e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Fehler beim Löschen des Meetings."));
        }
    }

    @PutMapping("/{meetingId}")
    public ResponseEntity<?> updateMeeting(
            @PathVariable Long meetingId,
            @Valid @RequestBody MeetingUpdateDto meetingUpdateDto,
            @AuthenticationPrincipal UserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            MeetingDto updatedMeeting = meetingService.updateMeeting(meetingId, meetingUpdateDto, currentUserDetails.getUsername());
            return ResponseEntity.ok(updatedMeeting);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new AuthController.ErrorResponse(e.getReason()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Fehler beim Aktualisieren des Meetings."));
        }
    }

}
