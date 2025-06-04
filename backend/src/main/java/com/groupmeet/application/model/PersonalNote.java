package com.groupmeet.application.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entity representing personal notes that users can add to specific dates in their calendar.
 * Each user can have one note per date, and notes are private to the user who created them.
 */
@Entity
@Table(name = "personal_notes",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "note_date"},
                        name = "uk_user_note_date")
        })
public class PersonalNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Benutzer ist erforderlich")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Datum ist erforderlich")
    @Column(name = "note_date", nullable = false)
    private LocalDate noteDate;

    @NotNull(message = "Notiztext ist erforderlich")
    @Size(min = 1, max = 1000, message = "Notiz muss zwischen 1 und 1000 Zeichen lang sein")
    @Column(name = "content", nullable = false, length = 1000)
    private String content;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Default constructor for JPA
     */
    public PersonalNote() {
    }

    /**
     * Constructor for creating a new personal note
     *
     * @param user the user who owns this note
     * @param noteDate the date this note is associated with
     * @param content the text content of the note
     */
    public PersonalNote(User user, LocalDate noteDate, String content) {
        if (user == null) {
            throw new IllegalArgumentException("Benutzer darf nicht null sein.");
        }
        if (noteDate == null) {
            throw new IllegalArgumentException("Datum darf nicht null sein.");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Notizinhalt darf nicht leer sein.");
        }

        this.user = user;
        this.noteDate = noteDate;
        this.content = content.trim();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getNoteDate() {
        return noteDate;
    }

    public void setNoteDate(LocalDate noteDate) {
        this.noteDate = noteDate;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content != null ? content.trim() : null;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Updates the content of this note
     *
     * @param newContent the new content for the note
     */
    public void updateContent(String newContent) {
        if (newContent == null || newContent.trim().isEmpty()) {
            throw new IllegalArgumentException("Neuer Notizinhalt darf nicht leer sein.");
        }
        this.content = newContent.trim();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PersonalNote that = (PersonalNote) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "PersonalNote{" +
                "id=" + id +
                ", noteDate=" + noteDate +
                ", content='" + content + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}