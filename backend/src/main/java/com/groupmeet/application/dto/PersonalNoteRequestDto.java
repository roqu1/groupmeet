package com.groupmeet.application.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonFormat;

public class PersonalNoteRequestDto {
    @NotNull(message = "Datum ist erforderlich")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate noteDate;

    @NotNull(message = "Notizinhalt ist erforderlich")
    @Size(min = 1, max = 1000, message = "Notiz muss zwischen 1 und 1000 Zeichen lang sein")
    private String content;

    public PersonalNoteRequestDto() {}

    public PersonalNoteRequestDto(LocalDate noteDate, String content) {
        this.noteDate = noteDate;
        this.content = content;
    }

    public LocalDate getNoteDate() { return noteDate; }
    public void setNoteDate(LocalDate noteDate) { this.noteDate = noteDate; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}