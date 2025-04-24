package com.groupmeet.application.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.groupmeet.application.dto.UserRegistrationDto;
import com.groupmeet.application.fixture.UserFixture;
import com.groupmeet.application.model.User;
import com.groupmeet.application.repository.UserRepository;
import com.groupmeet.application.service.UserService.UserRegistrationException;

/**
 * Tests for User Service
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("User Service Tests")
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

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
}