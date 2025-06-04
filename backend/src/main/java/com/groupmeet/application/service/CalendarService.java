package com.groupmeet.application.service;

import com.groupmeet.application.dto.*;
import com.groupmeet.application.model.*;
import com.groupmeet.application.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Validated
public class CalendarService {

    private static final Logger logger = LoggerFactory.getLogger(CalendarService.class);

    @Autowired
    private PersonalNoteRepository personalNoteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendshipRepository friendshipRepository;

    // FIXED: Uncommented MeetingRepository
    @Autowired
    private MeetingRepository meetingRepository;

    @Transactional(readOnly = true)
    public CalendarDataDto getCalendarData(String username, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + username));

        logger.debug("Loading calendar data for user {} from {} to {}", username, startDate, endDate);

        // Get meetings for the user in the date range
        List<CalendarEventDto> events = getMeetingEventsForUser(user, startDate, endDate);

        // Get personal notes for the date range
        List<PersonalNoteDto> notes = personalNoteRepository
                .findByUserAndNoteDateBetween(user, startDate, endDate)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        // Get dates that have notes (for efficient calendar marking)
        List<LocalDate> datesWithNotes = personalNoteRepository
                .findNoteDatesByUserAndDateRange(user, startDate, endDate);

        return new CalendarDataDto(events, notes, datesWithNotes);
    }

    @Transactional(readOnly = true)
    public DayDetailsDto getDayDetails(String username, LocalDate date) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + username));

        logger.debug("Loading day details for user {} on date {}", username, date);

        // Get events for the specific date
        List<CalendarEventDto> eventsForDay = getMeetingEventsForUser(user, date, date);

        // Get note for the specific date (if exists)
        PersonalNoteDto noteForDay = personalNoteRepository
                .findByUserAndNoteDate(user, date)
                .map(this::convertToDto)
                .orElse(null);

        return new DayDetailsDto(date, eventsForDay, noteForDay);
    }

    @Transactional
    public PersonalNoteDto savePersonalNote(String username, @Valid PersonalNoteRequestDto request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + username));

        logger.debug("Saving personal note for user {} on date {}", username, request.getNoteDate());

        // Check if a note already exists for this date
        Optional<PersonalNote> existingNote = personalNoteRepository
                .findByUserAndNoteDate(user, request.getNoteDate());

        PersonalNote note;
        if (existingNote.isPresent()) {
            // Update existing note
            note = existingNote.get();
            note.updateContent(request.getContent());
            logger.debug("Updated existing note with ID {} for user {}", note.getId(), username);
        } else {
            // Create new note
            note = new PersonalNote(user, request.getNoteDate(), request.getContent());
            logger.debug("Created new note for user {} on date {}", username, request.getNoteDate());
        }

        PersonalNote savedNote = personalNoteRepository.save(note);
        return convertToDto(savedNote);
    }

    @Transactional
    public void deletePersonalNote(String username, LocalDate date) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + username));

        Optional<PersonalNote> note = personalNoteRepository.findByUserAndNoteDate(user, date);
        if (note.isPresent()) {
            personalNoteRepository.delete(note.get());
            logger.info("Deleted personal note for user {} on date {}", username, date);
        } else {
            logger.warn("Attempted to delete non-existent note for user {} on date {}", username, date);
        }
    }

    @Transactional(readOnly = true)
    public boolean canViewCalendar(String calendarOwnerUsername, String viewerUsername) {
        // User can always view their own calendar
        if (calendarOwnerUsername.equals(viewerUsername)) {
            return true;
        }

        User calendarOwner = userRepository.findByUsername(calendarOwnerUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Kalenderbesitzer nicht gefunden: " + calendarOwnerUsername));

        User viewer = userRepository.findByUsername(viewerUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Betrachter nicht gefunden: " + viewerUsername));

        // Check if they are friends
        Optional<Friendship> friendship = friendshipRepository
                .findFriendshipBetweenUsersWithStatus(calendarOwner, viewer, FriendshipStatus.ACCEPTED);

        boolean canView = friendship.isPresent();
        logger.debug("Calendar access check: {} can view {}'s calendar: {}",
                viewerUsername, calendarOwnerUsername, canView);

        return canView;
    }

    private List<CalendarEventDto> getMeetingEventsForUser(User user, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        logger.debug("Loading meetings for user {} from {} to {}", user.getUsername(), startDateTime, endDateTime);

        try {
            List<Meeting> userMeetings = meetingRepository.findMeetingsForUserInDateRange(
                    user.getId(), startDateTime, endDateTime);

            return userMeetings.stream()
                    .map(meeting -> convertMeetingToCalendarEvent(meeting, user))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error loading meetings for user {}: {}", user.getUsername(), e.getMessage());
            return List.of();
        }
    }

    private CalendarEventDto convertMeetingToCalendarEvent(Meeting meeting, User user) {
        try {
            return new CalendarEventDto(
                    meeting.getId(),
                    meeting.getTitle(),
                    meeting.getDescription(),
                    meeting.getDateTime(),
                    meeting.getLocation(),
                    meeting.getFormat().toString(),
                    meeting.getCreator().equals(user),
                    meeting.getParticipants().size()
            );
        } catch (Exception e) {
            logger.error("Error converting meeting to calendar event: {}", e.getMessage());
            return new CalendarEventDto(
                    0L,
                    "Error Loading Meeting",
                    "Could not load meeting details",
                    LocalDateTime.now(),
                    "Unknown Location",
                    "OFFLINE",
                    false,
                    0
            );
        }
    }

    private PersonalNoteDto convertToDto(PersonalNote note) {
        return new PersonalNoteDto(
                note.getId(),
                note.getNoteDate(),
                note.getContent(),
                note.getCreatedAt(),
                note.getUpdatedAt()
        );
    }

    public static class CalendarException extends RuntimeException {
        public CalendarException(String message) {
            super(message);
        }

        public CalendarException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}