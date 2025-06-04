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

/**
 * Service class for calendar-related operations.
 * Handles both personal notes and meeting calendar integration.
 * Follows the same pattern as your existing UserService.
 */
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

    @Autowired
    private MeetingRepository meetingRepository; // Assuming this exists based on your structure

    /**
     * Get complete calendar data for a user within a date range.
     * This includes both meetings and personal notes.
     *
     * @param username the username of the calendar owner
     * @param startDate the start date for calendar data
     * @param endDate the end date for calendar data
     * @return calendar data containing events and notes
     */
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

    /**
     * Get detailed information for a specific date.
     * This is called when a user clicks on a calendar date.
     *
     * @param username the username of the calendar owner
     * @param date the specific date to get details for
     * @return day details including events and notes for that date
     */
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

    /**
     * Create or update a personal note for a specific date.
     * If a note already exists for that date, it will be updated.
     *
     * @param username the username of the note owner
     * @param request the note request data
     * @return the created or updated note
     */
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

    /**
     * Delete a personal note for a specific date.
     *
     * @param username the username of the note owner
     * @param date the date of the note to delete
     */
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

    /**
     * Check if a viewer has permission to access another user's calendar.
     * Calendar access is restricted to friends only (as per requirement A_11).
     *
     * @param calendarOwnerUsername the owner of the calendar
     * @param viewerUsername the user trying to view the calendar
     * @return true if access is allowed, false otherwise
     */
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

    /**
     * Get meeting events for a user within a date range.
     * This method would integrate with your existing meeting system.
     *
     * @param user the user whose meetings to retrieve
     * @param startDate start of the date range
     * @param endDate end of the date range
     * @return list of calendar events representing meetings
     */
    private List<CalendarEventDto> getMeetingEventsForUser(User user, LocalDate startDate, LocalDate endDate) {
        // This method needs to be implemented based on your Meeting entity structure
        // Since I can't see your Meeting entity, I'm providing the structure you'll need

        /* Example implementation (you'll need to adapt based on your Meeting entity):

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<Meeting> userMeetings = meetingRepository.findMeetingsByUserAndDateRange(
            user, startDateTime, endDateTime);

        return userMeetings.stream()
            .map(meeting -> convertMeetingToCalendarEvent(meeting, user))
            .collect(Collectors.toList());
        */

        // Placeholder implementation - replace with actual meeting integration
        logger.warn("Meeting integration not yet implemented - returning empty events list");
        return List.of();
    }

    /**
     * Convert a Meeting entity to a CalendarEventDto.
     * This helper method transforms meeting data into calendar-friendly format.
     *
     * @param meeting the meeting entity
     * @param user the current user (to determine if they're the organizer)
     * @return calendar event DTO
     */
    private CalendarEventDto convertMeetingToCalendarEvent(Object meeting, User user) {
        // This method needs to be implemented based on your Meeting entity structure
        // Example structure:
        /*
        return new CalendarEventDto(
            meeting.getId(),
            meeting.getTitle(),
            meeting.getDescription(),
            meeting.getDateTime(),
            meeting.getLocation(),
            meeting.getFormat().toString(),
            meeting.getOrganizer().getId().equals(user.getId()),
            meeting.getParticipants().size()
        );
        */

        // Placeholder - replace with actual implementation
        throw new UnsupportedOperationException("Meeting to CalendarEvent conversion not yet implemented");
    }

    /**
     * Convert PersonalNote entity to PersonalNoteDto.
     *
     * @param note the personal note entity
     * @return personal note DTO
     */
    private PersonalNoteDto convertToDto(PersonalNote note) {
        return new PersonalNoteDto(
                note.getId(),
                note.getNoteDate(),
                note.getContent(),
                note.getCreatedAt(),
                note.getUpdatedAt()
        );
    }

    /**
     * Custom exception for calendar-related business logic errors.
     */
    public static class CalendarException extends RuntimeException {
        public CalendarException(String message) {
            super(message);
        }

        public CalendarException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}