package com.groupmeet.application.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.groupmeet.application.dto.ProfileFriendshipStatus;
import com.groupmeet.application.dto.UserRegistrationDto;
import com.groupmeet.application.dto.UserProfileDto;
import com.groupmeet.application.fixture.UserFixture;
import com.groupmeet.application.model.Friendship;
import com.groupmeet.application.model.FriendshipStatus;
import com.groupmeet.application.model.User;
import com.groupmeet.application.repository.FriendshipRepository;
import com.groupmeet.application.repository.InterestRepository;
import com.groupmeet.application.repository.UserRepository;
import com.groupmeet.application.service.UserService.UserRegistrationException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
@DisplayName("User Service Tests")
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private FriendshipRepository friendshipRepository;

    @Mock
    private InterestRepository interestRepository;

    @InjectMocks
    private UserService userService;

    private User testUser1;
    private User testUser2;
    private User testUser3;

    @BeforeEach
    void setUp() {
        testUser1 = UserFixture.createTestMaleUser("user1");
        testUser1.setId(1L);
        testUser1.setBirthDate(LocalDate.now().minusYears(25));
        testUser1.setAboutMe("About User 1");
        testUser1.setLocation("Location 1");

        testUser2 = UserFixture.createTestFemaleUser("user2");
        testUser2.setId(2L);
        testUser2.setBirthDate(LocalDate.now().minusYears(30));

        testUser3 = UserFixture.createTestMaleUser("user3");
        testUser3.setId(3L);
    }

    @Test
    @DisplayName("Should successfully register a new user")
    public void shouldRegisterNewUser() {
        UserRegistrationDto registrationDto = UserFixture.createTestMaleUserRegistrationDto("test");
        
        when(userRepository.existsByEmail(registrationDto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(registrationDto.getUsername())).thenReturn(false);
        when(passwordEncoder.encode(registrationDto.getPassword())).thenReturn("encodedPassword");
        
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(1L);
            return savedUser;
        });

        User registeredUser = userService.registerNewUser(registrationDto);

        assertNotNull(registeredUser);
        assertEquals(1L, registeredUser.getId());
        assertEquals(registrationDto.getGenderEnum(), registeredUser.getGender());
        assertEquals(registrationDto.getFirstName(), registeredUser.getFirstName());
        assertEquals(registrationDto.getLastName(), registeredUser.getLastName());
        assertEquals(registrationDto.getUsername(), registeredUser.getUsername());
        assertEquals(registrationDto.getEmail(), registeredUser.getEmail());
        assertEquals("encodedPassword", registeredUser.getPassword());
        
        verify(userRepository).existsByEmail(registrationDto.getEmail());
        verify(userRepository).existsByUsername(registrationDto.getUsername());
        verify(passwordEncoder).encode(registrationDto.getPassword());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when registering with existing email")
    public void shouldThrowExceptionWhenRegisteringWithExistingEmail() {
        UserRegistrationDto registrationDto = UserFixture.createTestMaleUserRegistrationDto("test");
        
        when(userRepository.existsByEmail(registrationDto.getEmail())).thenReturn(true);

        UserRegistrationException exception = assertThrows(
            UserRegistrationException.class,
            () -> userService.registerNewUser(registrationDto)
        );
        
        assertEquals("E-Mail ist bereits registriert", exception.getMessage());
        
        verify(userRepository).existsByEmail(registrationDto.getEmail());
        verify(userRepository, never()).existsByUsername(anyString());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when registering with existing username")
    public void shouldThrowExceptionWhenRegisteringWithExistingUsername() {

        UserRegistrationDto registrationDto = UserFixture.createTestMaleUserRegistrationDto("test");
        
        when(userRepository.existsByEmail(registrationDto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(registrationDto.getUsername())).thenReturn(true);

        UserRegistrationException exception = assertThrows(
            UserRegistrationException.class,
            () -> userService.registerNewUser(registrationDto)
        );
        
        assertEquals("Benutzername ist bereits vergeben", exception.getMessage());
        
        verify(userRepository).existsByEmail(registrationDto.getEmail());
        verify(userRepository).existsByUsername(registrationDto.getUsername());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Get User Profile - Viewing Own Profile")
    void getUserProfile_viewingOwnProfile() {
        when(userRepository.findById(testUser1.getId())).thenReturn(Optional.of(testUser1));
        when(userRepository.findByUsername(testUser1.getUsername())).thenReturn(Optional.of(testUser1));
        when(friendshipRepository.countAcceptedFriendsForUser(testUser1)).thenReturn(0L);
        when(friendshipRepository.findFriendshipsByUserAndStatus(eq(testUser1), eq(FriendshipStatus.ACCEPTED), any(PageRequest.class)))
            .thenReturn(new PageImpl<>(new ArrayList<>()));
        when(friendshipRepository.countPendingIncomingRequestsForUser(testUser1)).thenReturn(2L);

        UserProfileDto profileDto = userService.getUserProfile(testUser1.getId(), testUser1.getUsername());

        assertNotNull(profileDto);
        assertEquals(testUser1.getId(), profileDto.getId());
        assertEquals("About User 1", profileDto.getAboutMe());
        assertEquals(25, profileDto.getAge());
        assertEquals(ProfileFriendshipStatus.SELF, profileDto.getFriendshipStatusWithViewer());
        assertEquals(2, profileDto.getPendingFriendRequestsCount());
        assertTrue(profileDto.getAchievements().isEmpty());
    }

    @Test
    @DisplayName("Get User Profile - Viewing Other Profile (No Relation)")
    void getUserProfile_viewingOtherProfile_noRelation() {
        when(userRepository.findById(testUser2.getId())).thenReturn(Optional.of(testUser2));
        when(userRepository.findByUsername(testUser1.getUsername())).thenReturn(Optional.of(testUser1));
        when(friendshipRepository.countAcceptedFriendsForUser(testUser2)).thenReturn(3L);
        when(friendshipRepository.findFriendshipsByUserAndStatus(eq(testUser2), eq(FriendshipStatus.ACCEPTED), any(PageRequest.class)))
             .thenReturn(new PageImpl<>(new ArrayList<>()));
        when(friendshipRepository.findFriendshipBetweenUsers(testUser2, testUser1)).thenReturn(Optional.empty());


        UserProfileDto profileDto = userService.getUserProfile(testUser2.getId(), testUser1.getUsername());

        assertNotNull(profileDto);
        assertEquals(testUser2.getId(), profileDto.getId());
        assertEquals(30, profileDto.getAge());
        assertEquals(ProfileFriendshipStatus.NONE, profileDto.getFriendshipStatusWithViewer());
        assertNull(profileDto.getPendingFriendRequestsCount());
        assertTrue(profileDto.getAchievements().isEmpty());
    }
    
    @Test
    @DisplayName("Get User Profile - Viewing Other Profile (Friends) with Achievement")
    void getUserProfile_viewingOtherProfile_areFriends_withAchievement() {
        when(userRepository.findById(testUser2.getId())).thenReturn(Optional.of(testUser2));
        when(userRepository.findByUsername(testUser1.getUsername())).thenReturn(Optional.of(testUser1));
        when(friendshipRepository.countAcceptedFriendsForUser(testUser2)).thenReturn(5L); 
        List<Friendship> friendConnections = new ArrayList<>();
        when(friendshipRepository.findFriendshipsByUserAndStatus(eq(testUser2), eq(FriendshipStatus.ACCEPTED), any(PageRequest.class)))
             .thenReturn(new PageImpl<>(friendConnections));
        
        Friendship friendship = new Friendship(testUser1, testUser2, FriendshipStatus.ACCEPTED);
        when(friendshipRepository.findFriendshipBetweenUsers(testUser2, testUser1)).thenReturn(Optional.of(friendship));

        UserProfileDto profileDto = userService.getUserProfile(testUser2.getId(), testUser1.getUsername());

        assertNotNull(profileDto);
        assertEquals(ProfileFriendshipStatus.FRIENDS, profileDto.getFriendshipStatusWithViewer());
        assertEquals(1, profileDto.getAchievements().size());
        assertEquals("Freundeskreis", profileDto.getAchievements().get(0).getName());
    }

    @Test
    @DisplayName("Get User Profile - Viewing Other Profile (Request Sent by Viewer)")
    void getUserProfile_viewingOtherProfile_requestSent() {
        when(userRepository.findById(testUser2.getId())).thenReturn(Optional.of(testUser2));
        when(userRepository.findByUsername(testUser1.getUsername())).thenReturn(Optional.of(testUser1));
        when(friendshipRepository.countAcceptedFriendsForUser(testUser2)).thenReturn(0L);
         when(friendshipRepository.findFriendshipsByUserAndStatus(eq(testUser2), eq(FriendshipStatus.ACCEPTED), any(PageRequest.class)))
             .thenReturn(new PageImpl<>(new ArrayList<>()));

        Friendship pendingRequest = new Friendship(testUser1, testUser2, FriendshipStatus.PENDING);
        pendingRequest.setId(100L);
        when(friendshipRepository.findFriendshipBetweenUsers(testUser2, testUser1)).thenReturn(Optional.of(pendingRequest));

        UserProfileDto profileDto = userService.getUserProfile(testUser2.getId(), testUser1.getUsername());

        assertNotNull(profileDto);
        assertEquals(ProfileFriendshipStatus.REQUEST_SENT, profileDto.getFriendshipStatusWithViewer());
        assertEquals(100L, profileDto.getRelatedFriendshipId());
    }

    @Test
    @DisplayName("Get User Profile - Viewing Other Profile (Request Received by Viewer)")
    void getUserProfile_viewingOtherProfile_requestReceived() {
        when(userRepository.findById(testUser2.getId())).thenReturn(Optional.of(testUser2));
        when(userRepository.findByUsername(testUser1.getUsername())).thenReturn(Optional.of(testUser1));
        when(friendshipRepository.countAcceptedFriendsForUser(testUser2)).thenReturn(0L);
        when(friendshipRepository.findFriendshipsByUserAndStatus(eq(testUser2), eq(FriendshipStatus.ACCEPTED), any(PageRequest.class)))
             .thenReturn(new PageImpl<>(new ArrayList<>()));
        
        Friendship pendingRequest = new Friendship(testUser2, testUser1, FriendshipStatus.PENDING);
        pendingRequest.setId(101L);
        when(friendshipRepository.findFriendshipBetweenUsers(testUser2, testUser1)).thenReturn(Optional.of(pendingRequest));

        UserProfileDto profileDto = userService.getUserProfile(testUser2.getId(), testUser1.getUsername());

        assertNotNull(profileDto);
        assertEquals(ProfileFriendshipStatus.REQUEST_RECEIVED, profileDto.getFriendshipStatusWithViewer());
        assertEquals(101L, profileDto.getRelatedFriendshipId());
    }
    
    @Test
    @DisplayName("Get User Profile - Profile Not Found")
    void getUserProfile_profileNotFound() {
        Long nonExistentId = 999L;
        when(userRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            userService.getUserProfile(nonExistentId, testUser1.getUsername());
        });
    }
}