package com.groupmeet.application.service;

import com.groupmeet.application.dto.FriendDto;
import com.groupmeet.application.fixture.UserFixture;
import com.groupmeet.application.model.Friendship;
import com.groupmeet.application.model.FriendshipStatus;
import com.groupmeet.application.model.User;
import com.groupmeet.application.repository.FriendshipRepository;
import com.groupmeet.application.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Friend Service Tests")
class FriendServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FriendshipRepository friendshipRepository;

    @InjectMocks
    private FriendService friendService;

    private User currentUser;
    private User friend1;
    private User friend2;
    private Friendship friendship1;
    private Friendship friendship2;

    @BeforeEach
    void setUp() {
        currentUser = UserFixture.createTestMaleUser("current");
        currentUser.setId(1L);

        friend1 = UserFixture.createTestFemaleUser("friend1");
        friend1.setId(2L);

        friend2 = UserFixture.createTestMaleUser("friend2");
        friend2.setId(3L);

        friendship1 = new Friendship(currentUser, friend1, FriendshipStatus.ACCEPTED);
        friendship1.setId(101L);
        friendship2 = new Friendship(friend2, currentUser, FriendshipStatus.ACCEPTED);
        friendship2.setId(102L);
    }

    @Test
    @DisplayName("Should return a paginated list of friends")
    void getFriends_shouldReturnFriends() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
        List<Friendship> friendships = Arrays.asList(friendship1, friendship2);
        Page<Friendship> friendshipPage = new PageImpl<>(friendships, pageable, friendships.size());

        when(userRepository.findByUsername(currentUser.getUsername())).thenReturn(Optional.of(currentUser));
        when(friendshipRepository.findFriendshipsByUserAndStatus(eq(currentUser), eq(FriendshipStatus.ACCEPTED), any(Pageable.class)))
                .thenReturn(friendshipPage);

        Page<FriendDto> result = friendService.getFriends(currentUser.getUsername(), null, pageable);

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals(2, result.getContent().size());
        assertTrue(result.getContent().stream().anyMatch(f -> f.getId().equals(friend1.getId())));
        assertTrue(result.getContent().stream().anyMatch(f -> f.getId().equals(friend2.getId())));

        verify(userRepository).findByUsername(currentUser.getUsername());
        verify(friendshipRepository).findFriendshipsByUserAndStatus(eq(currentUser), eq(FriendshipStatus.ACCEPTED), any(Pageable.class));
    }

    @Test
    @DisplayName("Should return a paginated list of friends matching search term")
    void getFriends_shouldReturnFriendsBySearchTerm() {
        String searchTerm = "friend1";
        Pageable pageable = PageRequest.of(0, 10);
        List<Friendship> friendships = Collections.singletonList(friendship1); // Only friend1 matches
        Page<Friendship> friendshipPage = new PageImpl<>(friendships, pageable, friendships.size());

        when(userRepository.findByUsername(currentUser.getUsername())).thenReturn(Optional.of(currentUser));
        when(friendshipRepository.findFriendshipsByUserAndStatusAndSearchTerm(
                eq(currentUser), eq(FriendshipStatus.ACCEPTED), eq(searchTerm), any(Pageable.class)))
                .thenReturn(friendshipPage);

        Page<FriendDto> result = friendService.getFriends(currentUser.getUsername(), searchTerm, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        assertEquals(friend1.getId(), result.getContent().get(0).getId());

        verify(userRepository).findByUsername(currentUser.getUsername());
        verify(friendshipRepository).findFriendshipsByUserAndStatusAndSearchTerm(
                eq(currentUser), eq(FriendshipStatus.ACCEPTED), eq(searchTerm), any(Pageable.class));
    }

    @Test
    @DisplayName("getFriends should throw UsernameNotFoundException if current user not found")
    void getFriends_shouldThrowException_whenCurrentUserNotFound() {
        String nonExistentUsername = "unknownuser";
        when(userRepository.findByUsername(nonExistentUsername)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            friendService.getFriends(nonExistentUsername, null, PageRequest.of(0, 10));
        });
    }


    @Test
    @DisplayName("Should successfully remove a friend")
    void removeFriend_shouldRemoveSuccessfully() {
        when(userRepository.findByUsername(currentUser.getUsername())).thenReturn(Optional.of(currentUser));
        when(userRepository.findById(friend1.getId())).thenReturn(Optional.of(friend1));
        when(friendshipRepository.findFriendshipBetweenUsersWithStatus(currentUser, friend1, FriendshipStatus.ACCEPTED))
                .thenReturn(Optional.of(friendship1));
        doNothing().when(friendshipRepository).delete(friendship1);

        assertDoesNotThrow(() -> friendService.removeFriend(currentUser.getUsername(), friend1.getId()));

        verify(friendshipRepository).delete(friendship1);
    }

    @Test
    @DisplayName("removeFriend should throw UsernameNotFoundException if current user not found")
    void removeFriend_shouldThrowException_whenCurrentUserNotFound() {
        String nonExistentUsername = "unknownuser";
        when(userRepository.findByUsername(nonExistentUsername)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            friendService.removeFriend(nonExistentUsername, friend1.getId());
        });
        verify(friendshipRepository, never()).delete(any());
    }

    @Test
    @DisplayName("removeFriend should throw UsernameNotFoundException if friend to remove not found")
    void removeFriend_shouldThrowException_whenFriendToRemoveNotFound() {
        Long nonExistentFriendId = 999L;
        when(userRepository.findByUsername(currentUser.getUsername())).thenReturn(Optional.of(currentUser));
        when(userRepository.findById(nonExistentFriendId)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            friendService.removeFriend(currentUser.getUsername(), nonExistentFriendId);
        });
        verify(friendshipRepository, never()).delete(any());
    }

    @Test
    @DisplayName("removeFriend should throw IllegalArgumentException if trying to remove self")
    void removeFriend_shouldThrowException_whenRemovingSelf() {
        when(userRepository.findByUsername(currentUser.getUsername())).thenReturn(Optional.of(currentUser));
        when(userRepository.findById(currentUser.getId())).thenReturn(Optional.of(currentUser));


        assertThrows(IllegalArgumentException.class, () -> {
            friendService.removeFriend(currentUser.getUsername(), currentUser.getId());
        });
        verify(friendshipRepository, never()).delete(any());
    }

    @Test
    @DisplayName("removeFriend should throw FriendNotFoundException if no active friendship exists")
    void removeFriend_shouldThrowException_whenNoActiveFriendship() {
        when(userRepository.findByUsername(currentUser.getUsername())).thenReturn(Optional.of(currentUser));
        when(userRepository.findById(friend1.getId())).thenReturn(Optional.of(friend1));
        when(friendshipRepository.findFriendshipBetweenUsersWithStatus(currentUser, friend1, FriendshipStatus.ACCEPTED))
                .thenReturn(Optional.empty());

        assertThrows(FriendService.FriendNotFoundException.class, () -> {
            friendService.removeFriend(currentUser.getUsername(), friend1.getId());
        });
        verify(friendshipRepository, never()).delete(any());
    }
}