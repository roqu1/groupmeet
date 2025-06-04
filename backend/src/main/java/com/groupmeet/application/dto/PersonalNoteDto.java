package com.groupmeet.application.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for personal note data transfer.
 * Used for both requests and responses involving personal notes.
 */
public class PersonalNoteDto {
    private Long id;

    @NotNull(message = "Datum ist erforderlich")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate noteDate;

    @NotNull(message = "Notizinhalt ist erforderlich")
    @Size(min = 1, max = 1000, message = "Notiz muss zwischen 1 und 1000 Zeichen lang sein")
    private String content;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Constructors
    public PersonalNoteDto() {}

    public PersonalNoteDto(Long id, LocalDate noteDate, String content,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.noteDate = noteDate;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getNoteDate() { return noteDate; }
    public void setNoteDate(LocalDate noteDate) { this.noteDate = noteDate; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}