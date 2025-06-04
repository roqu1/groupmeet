package com.groupmeet.application.repository;

import com.groupmeet.application.model.PersonalNote;
import com.groupmeet.application.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for PersonalNote entities.
 * Follows the same pattern as your existing repositories like FriendshipRepository.
 */
@Repository
public interface PersonalNoteRepository extends JpaRepository<PersonalNote, Long> {

    /**
     * Find a specific note for a user on a specific date.
     * Since each user can only have one note per date (enforced by unique constraint),
     * this will return at most one result.
     *
     * @param user the user who owns the note
     * @param noteDate the date of the note
     * @return Optional containing the note if it exists
     */
    Optional<PersonalNote> findByUserAndNoteDate(User user, LocalDate noteDate);

    /**
     * Find all notes for a user within a date range.
     * This is useful for loading calendar data for a specific month or period.
     *
     * @param user the user whose notes to find
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @return list of notes within the date range, ordered by date
     */
    @Query("SELECT pn FROM PersonalNote pn " +
            "WHERE pn.user = :user " +
            "AND pn.noteDate >= :startDate " +
            "AND pn.noteDate <= :endDate " +
            "ORDER BY pn.noteDate ASC")
    List<PersonalNote> findByUserAndNoteDateBetween(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find all notes for a user, ordered by date descending (most recent first).
     * This could be useful for a "recent notes" feature or general note management.
     *
     * @param user the user whose notes to find
     * @return list of all notes for the user, ordered by date descending
     */
    List<PersonalNote> findByUserOrderByNoteDateDesc(User user);

    /**
     * Count the total number of notes a user has created.
     * This could be useful for user statistics or achievements.
     *
     * @param user the user whose notes to count
     * @return the total number of notes for the user
     */
    long countByUser(User user);

    /**
     * Check if a user has any notes on a specific date.
     * This is a more efficient way to check for note existence without loading the full note.
     *
     * @param user the user to check
     * @param noteDate the date to check
     * @return true if the user has a note on that date, false otherwise
     */
    boolean existsByUserAndNoteDate(User user, LocalDate noteDate);

    /**
     * Find all dates where a user has notes within a date range.
     * This is useful for efficiently marking calendar days that have notes
     * without loading the full note content.
     *
     * @param user the user whose note dates to find
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @return list of dates where the user has notes
     */
    @Query("SELECT pn.noteDate FROM PersonalNote pn " +
            "WHERE pn.user = :user " +
            "AND pn.noteDate >= :startDate " +
            "AND pn.noteDate <= :endDate " +
            "ORDER BY pn.noteDate ASC")
    List<LocalDate> findNoteDatesByUserAndDateRange(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}