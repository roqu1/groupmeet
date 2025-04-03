package com.groupmeet.application.controller;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import com.groupmeet.application.dto.UserRegistrationDto;
import com.groupmeet.application.fixture.UserFixture;
import com.groupmeet.application.repository.UserRepository;
import com.groupmeet.application.service.UserService;

/**
 * Tests for the user controller that verifies registration through the API
 */
@DisplayName("User Controller Tests")
public class UserControllerTest extends BaseControllerTest {

    private static final String REGISTER_URL = "/api/auth/register";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @BeforeEach
    public void setUp() {
        // Clear repository before each test for test isolation
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Should successfully register a new male user")
    @Transactional
    public void shouldRegisterNewMaleUser() throws Exception {
        // Given
        UserRegistrationDto registrationDto = UserFixture.createTestMaleUserRegistrationDto("1");

        // When
        ResultActions resultActions = performPost(REGISTER_URL, registrationDto);

        // Then
        resultActions
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.gender", is("MALE")))
                .andExpect(jsonPath("$.firstName", is(registrationDto.getFirstName())))
                .andExpect(jsonPath("$.lastName", is(registrationDto.getLastName())))
                .andExpect(jsonPath("$.username", is(registrationDto.getUsername())))
                .andExpect(jsonPath("$.email", is(registrationDto.getEmail())))
                .andExpect(jsonPath("$.password").doesNotExist()) // Password should not be returned
                .andExpect(jsonPath("$.createdAt", notNullValue()));
    }

    @Test
    @DisplayName("Should successfully register a new female user")
    @Transactional
    public void shouldRegisterNewFemaleUser() throws Exception {
        UserRegistrationDto registrationDto = UserFixture.createTestFemaleUserRegistrationDto("2");

        ResultActions resultActions = performPost(REGISTER_URL, registrationDto);

        resultActions
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.gender", is("FEMALE")))
                .andExpect(jsonPath("$.firstName", is(registrationDto.getFirstName())))
                .andExpect(jsonPath("$.lastName", is(registrationDto.getLastName())))
                .andExpect(jsonPath("$.username", is(registrationDto.getUsername())))
                .andExpect(jsonPath("$.email", is(registrationDto.getEmail())))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.createdAt", notNullValue()));
    }

    @Test
    @DisplayName("Should return error when registering with existing email")
    @Transactional
    public void shouldReturnErrorWhenRegisteringWithExistingEmail() throws Exception {
        // Given
        UserRegistrationDto firstUser = UserFixture.createTestMaleUserRegistrationDto("3");
        UserRegistrationDto secondUser = UserFixture.createTestMaleUserRegistrationDto("4");
        secondUser.setEmail(firstUser.getEmail());

        userService.registerNewUser(firstUser);

        ResultActions resultActions = performPost(REGISTER_URL, secondUser);

        resultActions
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("E-Mail ist bereits registriert")));
    }

    @Test
    @DisplayName("Should return error when registering with existing username")
    @Transactional
    public void shouldReturnErrorWhenRegisteringWithExistingUsername() throws Exception {
        UserRegistrationDto firstUser = UserFixture.createTestMaleUserRegistrationDto("5");
        UserRegistrationDto secondUser = UserFixture.createTestMaleUserRegistrationDto("6");
        secondUser.setUsername(firstUser.getUsername());

        userService.registerNewUser(firstUser);

        ResultActions resultActions = performPost(REGISTER_URL, secondUser);

        resultActions
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Benutzername ist bereits vergeben")));
    }

    @Test
    @DisplayName("Should return error when registering with invalid data")
    @Transactional
    public void shouldReturnErrorWhenRegisteringWithInvalidData() throws Exception {
        UserRegistrationDto invalidUser = new UserRegistrationDto();

        ResultActions resultActions = performPost(REGISTER_URL, invalidUser);

        resultActions
                .andExpect(status().isBadRequest());
    }
}