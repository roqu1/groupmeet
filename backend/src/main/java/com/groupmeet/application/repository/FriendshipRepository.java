package com.groupmeet.application.repository;

import com.groupmeet.application.model.Friendship;
import com.groupmeet.application.model.FriendshipStatus;
import com.groupmeet.application.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    @Query("SELECT f " +
            "FROM Friendship f " +
            "WHERE (f.userOne = :currentUser OR f.userTwo = :currentUser) AND f.status = :status")
    Page<Friendship> findFriendshipsByUserAndStatus(@Param("currentUser") User currentUser,
            @Param("status") FriendshipStatus status,
            Pageable pageable);

    @Query("SELECT f FROM Friendship f " +
            "WHERE (f.userOne = :currentUser AND f.status = :status AND " +
            "      (LOWER(f.userTwo.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "       LOWER(f.userTwo.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "       LOWER(f.userTwo.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')))) " +
            "OR (f.userTwo = :currentUser AND f.status = :status AND " +
            "      (LOWER(f.userOne.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "       LOWER(f.userOne.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "       LOWER(f.userOne.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))))")

    Page<Friendship> findFriendshipsByUserAndStatusAndSearchTerm(
            @Param("currentUser") User currentUser,
            @Param("status") FriendshipStatus status,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    @Query("SELECT f FROM Friendship f WHERE " +
            "((f.userOne = :user1 AND f.userTwo = :user2) OR (f.userOne = :user2 AND f.userTwo = :user1)) " +
            "AND f.status = :status")
    Optional<Friendship> findFriendshipBetweenUsersWithStatus(
            @Param("user1") User user1,
            @Param("user2") User user2,
            @Param("status") FriendshipStatus status);
}