package com.groupmeet.application.controller;

import com.groupmeet.application.dto.AuthResponseDto;
import com.groupmeet.application.dto.LoginRequestDto;
import com.groupmeet.application.dto.ResetPasswordRequestDto;
import com.groupmeet.application.dto.ForgotPasswordRequestDto;
import com.groupmeet.application.dto.UserRegistrationDto;
import com.groupmeet.application.model.User;
import com.groupmeet.application.repository.UserRepository;
import com.groupmeet.application.service.JwtService;
import com.groupmeet.application.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Environment environment; // Add this to detect development environment

    @Value("${jwt.cookie.name}")
    private String jwtCookieName;

    @Value("${jwt.expiration.ms}")
    private long jwtExpirationMs;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDto registrationDto) {
        try {
            User registeredUser = userService.registerNewUser(registrationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(AuthResponseDto.fromUser(registeredUser));
        } catch (UserService.UserRegistrationException e) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(
            @Valid @RequestBody LoginRequestDto loginRequest,
            HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtService.generateToken(userDetails);

            // Determine if we're in development environment
            boolean isDevelopment = isDevEnvironment();

            // Log cookie settings for debugging
            logger.info("Setting JWT cookie - Development mode: {}, Secure: {}",
                    isDevelopment, !isDevelopment);

            // Create HTTP-only cookie with environment-appropriate security settings
            ResponseCookie jwtCookie = ResponseCookie.from(jwtCookieName, jwt)
                    .httpOnly(true)
                    .secure(!isDevelopment) // Only secure in production
                    .path("/")
                    .maxAge(jwtExpirationMs / 1000)
                    .sameSite("Lax")
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());

            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Error: Authenticated user not found in DB."));

            logger.info("User {} successfully authenticated and cookie set", user.getUsername());
            return ResponseEntity.ok(AuthResponseDto.fromUser(user));

        } catch (AuthenticationException e) {
            logger.warn("Authentication failed for user: {}", loginRequest.getUsernameOrEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Ungültige Anmeldedaten"));

        } catch (Exception e) {
            logger.error("Unexpected error during authentication", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Ein interner Fehler ist aufgetreten."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletResponse response) {
        boolean isDevelopment = isDevEnvironment();

        // Create a cookie with the same name but empty value and maxAge=0 to clear it
        ResponseCookie cookie = ResponseCookie.from(jwtCookieName, "")
                .httpOnly(true)
                .secure(!isDevelopment) // Match the security setting used when creating the cookie
                .path("/")
                .maxAge(0) // Expire immediately
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        logger.info("User logout - cookie cleared");
        return ResponseEntity.ok(new MessageResponse("Logout successful!"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            logger.debug("Unauthenticated request to /me endpoint");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Not authenticated"));
        }

        String username = ((UserDetails) authentication.getPrincipal()).getUsername();

        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            logger.error("Authenticated user {} not found in database", username);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Authenticated user not found in database"));
        }

        logger.debug("Successfully returned user data for {}", username);
        return ResponseEntity.ok(AuthResponseDto.fromUser(userOptional.get()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto forgotPasswordRequest) {
        try {
            userService.initiatePasswordReset(forgotPasswordRequest.getEmail());
            return ResponseEntity
                    .ok(new MessageResponse(
                            "Ein Link zum Zurücksetzen des Passworts an die E-Mail-Adresse wurde gesendet."));
        } catch (Exception e) {
            logger.error("Unerwarteter Fehler beim Zurücksetzen des Passworts für die E-Mail {}: {}",
                    forgotPasswordRequest.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(
                            "Ein interner Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut."));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequestDto resetRequest) {
        try {
            userService.resetPassword(resetRequest.getToken(), resetRequest.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Passwort erfolgreich zurückgesetzt."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Fehler beim Zurücksetzen des Passworts: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Ein interner Serverfehler ist aufgetreten."));
        }
    }

    /**
     * Determines if the application is running in development environment
     * based on active Spring profiles and configuration properties
     */
    private boolean isDevEnvironment() {
        // Check if 'dev' profile is active
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("dev".equals(profile) || "development".equals(profile)) {
                return true;
            }
        }

        // Fallback: check CORS environment setting
        String corsEnvironment = environment.getProperty("cors.environment", "local");
        return "local".equals(corsEnvironment) || "dev".equals(corsEnvironment);
    }

    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}