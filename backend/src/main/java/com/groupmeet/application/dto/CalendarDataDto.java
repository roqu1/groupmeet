package com.groupmeet.application.dto;

import java.time.LocalDate;
import java.util.List;

public class CalendarDataDto {
    private List<CalendarEventDto> events;
    private List<PersonalNoteDto> notes;
    private List<LocalDate> datesWithNotes; // For efficient calendar day marking

    public CalendarDataDto() {}

    public CalendarDataDto(List<CalendarEventDto> events, List<PersonalNoteDto> notes,
                           List<LocalDate> datesWithNotes) {
        this.events = events;
        this.notes = notes;
        this.datesWithNotes = datesWithNotes;
    }

    public List<CalendarEventDto> getEvents() { return events; }
    public void setEvents(List<CalendarEventDto> events) { this.events = events; }

    public List<PersonalNoteDto> getNotes() { return notes; }
    public void setNotes(List<PersonalNoteDto> notes) { this.notes = notes; }

    public List<LocalDate> getDatesWithNotes() { return datesWithNotes; }
    public void setDatesWithNotes(List<LocalDate> datesWithNotes) { this.datesWithNotes = datesWithNotes; }
}