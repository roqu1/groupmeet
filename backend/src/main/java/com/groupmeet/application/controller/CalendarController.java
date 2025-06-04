package com.groupmeet.application.controller;

import com.groupmeet.application.dto.*;
import com.groupmeet.application.service.CalendarService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.time.LocalDate;

/**
 * REST Controller for calendar-related operations.
 * Follows the same pattern as your existing UserController.
 *
 * Endpoints:
 * - GET /api/calendar - Get current user's calendar data
 * - GET /api/calendar/{userId} - Get specific user's calendar data (friends only)
 * - GET /api/calendar/day/{date} - Get day details for current user
 * - GET /api/calendar/{userId}/day/{date} - Get day details for specific user
 * - POST /api/calendar/notes - Create/update personal note
 * - DELETE /api/calendar/notes/{date} - Delete personal note
 */
@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private static final Logger logger = LoggerFactory.getLogger(CalendarController.class);

    @Autowired
    private CalendarService calendarService;

    /**
     * Get calendar data for the current authenticated user.
     * This endpoint handles requirement A_1 (authenticated user access to own calendar).
     *
     * @param startDate start date for calendar data (format: yyyy-MM-dd)
     * @param endDate end date for calendar data (format: yyyy-MM-dd)
     * @param userDetails the authenticated user
     * @return calendar data including events and notes
     */
    @GetMapping
    public ResponseEntity<CalendarDataDto> getCurrentUserCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            logger.debug("Getting calendar data for user {} from {} to {}",
                    userDetails.getUsername(), startDate, endDate);

            CalendarDataDto calendarData = calendarService.getCalendarData(
                    userDetails.getUsername(), startDate, endDate);

            return ResponseEntity.ok(calendarData);

        } catch (Exception e) {
            logger.error("Error getting calendar data for user {}: {}",
                    userDetails.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Get calendar data for a specific user.
     * This endpoint handles requirement A_11 (friend access to other users' calendars).
     * Access is restricted to friends only.
     *
     * @param userId the ID of the user whose calendar to view
     * @param startDate start date for calendar data
     * @param endDate end date for calendar data
     * @param viewerDetails the authenticated user (viewer)
     * @return calendar data if access is allowed, or appropriate error response
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserCalendar(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetails viewerDetails) {

        try {
            // First, we need to find the username for the userId
            // This would require a method in UserService to get username by ID
            // For now, I'll show the structure:

            logger.debug("User {} requesting calendar for user ID {} from {} to {}",
                    viewerDetails.getUsername(), userId, startDate, endDate);

            // TODO: Implement getUsernameById in UserService
            // String calendarOwnerUsername = userService.getUsernameById(userId);

            // Check if viewer has permission to access this calendar
            // boolean canView = calendarService.canViewCalendar(calendarOwnerUsername, viewerDetails.getUsername());

            // if (!canView) {
            //     return ResponseEntity.status(HttpStatus.FORBIDDEN)
            //             .body("Sie sind nicht berechtigt, diesen Kalender zu betrachten. Nur Freunde können Kalender einsehen.");
            // }

            // CalendarDataDto calendarData = calendarService.getCalendarData(calendarOwnerUsername, startDate, endDate);
            // return ResponseEntity.ok(calendarData);

            // Placeholder implementation
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                    .body("User calendar access not yet fully implemented");

        } catch (Exception e) {
            logger.error("Error getting calendar data for user ID {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Fehler beim Abrufen der Kalenderdaten");
        }
    }

    /**
     * Get detailed information for a specific date in the current user's calendar.
     * This endpoint handles requirement A_8 and A_9 (modal window with day details).
     *
     * @param date the date to get details for (format: yyyy-MM-dd)
     * @param userDetails the authenticated user
     * @return day details including events and notes for that date
     */
    @GetMapping("/day/{date}")
    public ResponseEntity<?> getCurrentUserDayDetails(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            logger.debug("Getting day details for user {} on date {}",
                    userDetails.getUsername(), date);

            DayDetailsDto dayDetails = calendarService.getDayDetails(userDetails.getUsername(), date);
            return ResponseEntity.ok(dayDetails);

        } catch (Exception e) {
            logger.error("Error getting day details for user {} on date {}: {}",
                    userDetails.getUsername(), date, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Fehler beim Abrufen der Tagesdetails");
        }
    }

    /**
     * Get detailed information for a specific date in another user's calendar.
     * Access is restricted to friends only.
     *
     * @param userId the ID of the user whose calendar day to view
     * @param date the date to get details for
     * @param viewerDetails the authenticated user (viewer)
     * @return day details if access is allowed, or appropriate error response
     */
    @GetMapping("/{userId}/day/{date}")
    public ResponseEntity<?> getUserDayDetails(
            @PathVariable Long userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserDetails viewerDetails) {

        try {
            logger.debug("User {} requesting day details for user ID {} on date {}",
                    viewerDetails.getUsername(), userId, date);

            // TODO: Similar to getUserCalendar, this needs username resolution and permission checking
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                    .body("User day details access not yet fully implemented");

        } catch (Exception e) {
            logger.error("Error getting day details for user ID {} on date {}: {}",
                    userId, date, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Fehler beim Abrufen der Tagesdetails");
        }
    }

    /**
     * Create or update a personal note for the current user.
     * This endpoint handles requirement A_7 (adding personal notes to dates).
     *
     * @param request the note creation/update request
     * @param userDetails the authenticated user
     * @return the created or updated note
     */
    @PostMapping("/notes")
    public ResponseEntity<?> savePersonalNote(
            @Valid @RequestBody PersonalNoteRequestDto request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            logger.debug("Saving personal note for user {} on date {}",
                    userDetails.getUsername(), request.getNoteDate());

            PersonalNoteDto savedNote = calendarService.savePersonalNote(
                    userDetails.getUsername(), request);

            return ResponseEntity.ok(savedNote);

        } catch (CalendarService.CalendarException e) {
            logger.warn("Calendar business logic error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {
            logger.error("Error saving personal note for user {}: {}",
                    userDetails.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Fehler beim Speichern der Notiz");
        }
    }

    /**
     * Delete a personal note for a specific date.
     * This endpoint handles requirement A_9 (editing/deleting existing notes).
     *
     * @param date the date of the note to delete (format: yyyy-MM-dd)
     * @param userDetails the authenticated user
     * @return success response or error
     */
    @DeleteMapping("/notes/{date}")
    public ResponseEntity<?> deletePersonalNote(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            logger.debug("Deleting personal note for user {} on date {}",
                    userDetails.getUsername(), date);

            calendarService.deletePersonalNote(userDetails.getUsername(), date);

            return ResponseEntity.ok()
                    .body("Notiz erfolgreich gelöscht");

        } catch (Exception e) {
            logger.error("Error deleting personal note for user {} on date {}: {}",
                    userDetails.getUsername(), date, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Fehler beim Löschen der Notiz");
        }
    }
}