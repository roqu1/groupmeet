package com.groupmeet.application.controller;

import com.groupmeet.application.dto.AuthResponseDto;
import com.groupmeet.application.dto.LoginRequestDto;
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

            // Create HTTP-only cookie
            ResponseCookie jwtCookie = ResponseCookie.from(jwtCookieName, jwt)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(jwtExpirationMs / 1000)
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());

            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Error: Authenticated user not found in DB."));

            return ResponseEntity.ok(AuthResponseDto.fromUser(user));

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Ungültige Anmeldedaten"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Ein interner Fehler ist aufgetreten."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletResponse response) {
        // Create a cookie with the same name but empty value and maxAge=0 to clear it
        ResponseCookie cookie = ResponseCookie.from(jwtCookieName, "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0) // Expire immediately
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(new MessageResponse("Logout successful!"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Not authenticated"));
        }

        String username = ((UserDetails) authentication.getPrincipal()).getUsername();

        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Authenticated user not found in database"));
        }

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