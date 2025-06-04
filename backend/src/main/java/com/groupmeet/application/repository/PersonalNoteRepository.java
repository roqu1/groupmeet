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

@Repository
public interface PersonalNoteRepository extends JpaRepository<PersonalNote, Long> {
    Optional<PersonalNote> findByUserAndNoteDate(User user, LocalDate noteDate);

    @Query("SELECT pn FROM PersonalNote pn " +
            "WHERE pn.user = :user " +
            "AND pn.noteDate >= :startDate " +
            "AND pn.noteDate <= :endDate " +
            "ORDER BY pn.noteDate ASC")
    List<PersonalNote> findByUserAndNoteDateBetween(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    List<PersonalNote> findByUserOrderByNoteDateDesc(User user);
    long countByUser(User user);
    boolean existsByUserAndNoteDate(User user, LocalDate noteDate);

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