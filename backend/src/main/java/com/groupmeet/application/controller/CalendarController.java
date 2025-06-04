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

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private static final Logger logger = LoggerFactory.getLogger(CalendarController.class);

    @Autowired
    private CalendarService calendarService;

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

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserCalendar(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetails viewerDetails) {

        try {
            logger.debug("User {} requesting calendar for user ID {} from {} to {}",
                    viewerDetails.getUsername(), userId, startDate, endDate);
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                    .body("User calendar access not yet fully implemented");

        } catch (Exception e) {
            logger.error("Error getting calendar data for user ID {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Fehler beim Abrufen der Kalenderdaten");
        }
    }

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

    @GetMapping("/{userId}/day/{date}")
    public ResponseEntity<?> getUserDayDetails(
            @PathVariable Long userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserDetails viewerDetails) {

        try {
            logger.debug("User {} requesting day details for user ID {} on date {}",
                    viewerDetails.getUsername(), userId, date);
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                    .body("User day details access not yet fully implemented");

        } catch (Exception e) {
            logger.error("Error getting day details for user ID {} on date {}: {}",
                    userId, date, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Fehler beim Abrufen der Tagesdetails");
        }
    }

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