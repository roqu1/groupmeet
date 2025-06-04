package com.groupmeet.application.dto;

import java.time.LocalDate;
import java.util.List;
/**
 * DTO for day detail information, used when a user clicks on a specific date.
 * Contains all events and notes for that specific date.
 */
public class DayDetailsDto {
    private LocalDate date;
    private List<CalendarEventDto> eventsForDay;
    private PersonalNoteDto noteForDay; // null if no note exists

    public DayDetailsDto() {}

    public DayDetailsDto(LocalDate date, List<CalendarEventDto> eventsForDay, PersonalNoteDto noteForDay) {
        this.date = date;
        this.eventsForDay = eventsForDay;
        this.noteForDay = noteForDay;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public List<CalendarEventDto> getEventsForDay() { return eventsForDay; }
    public void setEventsForDay(List<CalendarEventDto> eventsForDay) { this.eventsForDay = eventsForDay; }

    public PersonalNoteDto getNoteForDay() { return noteForDay; }
    public void setNoteForDay(PersonalNoteDto noteForDay) { this.noteForDay = noteForDay; }
}