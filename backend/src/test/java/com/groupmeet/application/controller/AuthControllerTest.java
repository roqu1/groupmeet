package com.groupmeet.application.controller;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.groupmeet.application.config.JwtAuthenticationFilter;
import com.groupmeet.application.config.SecurityConfig;
import com.groupmeet.application.dto.LoginRequestDto;
import com.groupmeet.application.dto.UserRegistrationDto;
import com.groupmeet.application.fixture.UserFixture;
import com.groupmeet.application.model.Gender;
import com.groupmeet.application.model.User;
import com.groupmeet.application.repository.UserRepository;
import com.groupmeet.application.service.EmailService;
import com.groupmeet.application.service.JwtService;
import com.groupmeet.application.service.UserDetailsServiceImpl;
import com.groupmeet.application.service.UserService;
import com.groupmeet.application.config.CacheConfig;
import com.groupmeet.application.service.EmailService;
import com.google.common.cache.Cache;
import org.springframework.beans.factory.annotation.Qualifier;

@WebMvcTest(controllers = AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, UserDetailsServiceImpl.class})
@DisplayName("Auth Controller Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private EmailService emailService;

    @MockBean
    @Qualifier("passwordResetRateLimitCache")
    private Cache<String, Long> passwordResetRateLimitCache;

    private static final String REGISTER_URL = "/api/auth/register";
    private static final String LOGIN_URL = "/api/auth/login";
    private static final String LOGOUT_URL = "/api/auth/logout";
    private static final String ME_URL = "/api/auth/me";

    private User testUser;
    private org.springframework.security.core.userdetails.User testUserDetails;

    @BeforeEach
    void setUp() {
        testUser = new User(Gender.MALE, "Test", "User", "testuser", "test@example.com", "encodedPassword");
        testUser.setId(1L);
        testUserDetails = new org.springframework.security.core.userdetails.User(
                testUser.getUsername(),
                testUser.getPassword(),
                new ArrayList<>()
        );
    }

    @Test
    @DisplayName("POST /register - Soll neuen User erfolgreich registrieren")
    void shouldRegisterNewUserSuccessfully() throws Exception {
        UserRegistrationDto registrationDto = UserFixture.createTestMaleUserRegistrationDto("reg");
        User registeredUser = new User(registrationDto.getGenderEnum(), registrationDto.getFirstName(), registrationDto.getLastName(), registrationDto.getUsername(), registrationDto.getEmail(), "encodedPassword");
        registeredUser.setId(1L);

        given(userService.registerNewUser(any(UserRegistrationDto.class))).willReturn(registeredUser);

        performPost(REGISTER_URL, registrationDto)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.username", is(registrationDto.getUsername())))
                .andExpect(jsonPath("$.email", is(registrationDto.getEmail())))
                .andExpect(jsonPath("$.firstName", is(registrationDto.getFirstName())))
                .andExpect(jsonPath("$.gender", is(Gender.MALE.name())));
    }

    @Test
    @DisplayName("POST /login - Soll User erfolgreich einloggen und Cookies setzen")
    void shouldLoginSuccessfullyAndSetCookies() throws Exception {
        LoginRequestDto loginRequest = new LoginRequestDto();
        loginRequest.setUsernameOrEmail(testUser.getUsername());
        loginRequest.setPassword("password123");

        String fakeJwt = "fake.jwt.token";
        Authentication successfulAuth = new UsernamePasswordAuthenticationToken(testUserDetails, null, testUserDetails.getAuthorities());

        given(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).willReturn(successfulAuth);
        given(jwtService.generateToken(testUserDetails)).willReturn(fakeJwt);
        given(userRepository.findByUsername(testUser.getUsername())).willReturn(Optional.of(testUser));

        performPost(LOGIN_URL, loginRequest)
                .andExpect(status().isOk())
                .andExpect(cookie().exists("accessToken"))
                .andExpect(cookie().httpOnly("accessToken", true))
                .andExpect(cookie().sameSite("accessToken", "Lax"))
                .andExpect(cookie().path("accessToken", "/"))
                .andExpect(cookie().maxAge("accessToken", is(3600)))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.username", is(testUser.getUsername())))
                .andExpect(jsonPath("$.email", is(testUser.getEmail())));
    }

    @Test
    @DisplayName("POST /login - Soll 401 bei ungültigen Credentials zurückgeben")
    void shouldReturnUnauthorizedForInvalidCredentials() throws Exception {
        LoginRequestDto loginRequest = new LoginRequestDto();
        loginRequest.setUsernameOrEmail("wronguser");
        loginRequest.setPassword("wrongpassword");

        given(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .willThrow(new BadCredentialsException("Bad credentials"));

        performPost(LOGIN_URL, loginRequest)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Ungültige Anmeldedaten")))
                .andExpect(cookie().doesNotExist("accessToken"))
                .andExpect(cookie().doesNotExist("XSRF-TOKEN"));
    }

    @Test
    @DisplayName("POST /logout - Soll Cookies löschen und Erfolg melden")
    void shouldLogoutSuccessfullyAndClearCookies() throws Exception {
        mockMvc.perform(post(LOGOUT_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("accessToken"))
                .andExpect(cookie().maxAge("accessToken", is(0)))
                .andExpect(jsonPath("$.message", is("Logout successful!")));
    }

    @Test
    @DisplayName("GET /me - Soll User-Daten für authentifizierten User zurückgeben")
    @WithMockUser(username = "testuser")
    void shouldReturnUserDataForAuthenticatedUser() throws Exception {
        given(userRepository.findByUsername("testuser")).willReturn(Optional.of(testUser));

        mockMvc.perform(get(ME_URL)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.username", is(testUser.getUsername())))
                .andExpect(jsonPath("$.email", is(testUser.getEmail())));
    }

    @Test
    @DisplayName("GET /me - Soll 401 für nicht authentifizierten User zurückgeben")
    void shouldReturnUnauthorizedForUnauthenticatedUser() throws Exception {
        mockMvc.perform(get(ME_URL)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    protected ResultActions performPost(String url, Object body) throws Exception {
        MockHttpServletRequestBuilder request = MockMvcRequestBuilders
                .post(url)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body));
        return mockMvc.perform(request);
    }

    @Test
    @DisplayName("POST /register - Soll Fehler 409 bei Registrierung mit existierendem Email zurückgeben")
    void shouldReturnConflictWhenRegisteringWithExistingEmailDifferentCase() throws Exception {
        given(userService.registerNewUser(any(UserRegistrationDto.class)))
                .willThrow(new UserService.UserRegistrationException("E-Mail ist bereits registriert"));

        UserRegistrationDto registrationDto = UserFixture.createTestMaleUserRegistrationDto("case");
        registrationDto.setEmail("TEST.CASE@EXAMPLE.COM");

        performPost(REGISTER_URL, registrationDto)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", is("E-Mail ist bereits registriert")));
    }

    @Test
    @DisplayName("POST /register - Soll Fehler 409 bei Registrierung mit existierendem Username zurückgeben")
    void shouldReturnConflictWhenRegisteringWithExistingUsernameDifferentCase() throws Exception {
         given(userService.registerNewUser(any(UserRegistrationDto.class)))
                .willThrow(new UserService.UserRegistrationException("Benutzername ist bereits vergeben"));

        UserRegistrationDto registrationDto = UserFixture.createTestMaleUserRegistrationDto("case");
        registrationDto.setEmail("unique.case.email@example.com");
        registrationDto.setUsername("TESTUSERCASE");

        performPost(REGISTER_URL, registrationDto)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", is("Benutzername ist bereits vergeben")));
    }
}