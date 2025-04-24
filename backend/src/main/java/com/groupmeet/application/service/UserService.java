package com.groupmeet.application.service;

import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import com.google.common.cache.Cache;
import com.groupmeet.application.dto.UserRegistrationDto;
import com.groupmeet.application.exception.RateLimitException;
import com.groupmeet.application.model.User;
import com.groupmeet.application.repository.UserRepository;

import jakarta.validation.Valid;

@Service
@Validated
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    @Qualifier("passwordResetRateLimitCache")
    private Cache<String, Long> passwordResetRateLimitCache;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerNewUser(@Valid UserRegistrationDto registrationDto) {

        String lowerCaseEmail = registrationDto.getEmail().toLowerCase(Locale.ROOT);
        String lowerCaseUsername = registrationDto.getUsername().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(lowerCaseEmail)) {
            throw new UserRegistrationException("E-Mail ist bereits registriert");
        }

        if (userRepository.existsByUsername(lowerCaseUsername)) {
            throw new UserRegistrationException("Benutzername ist bereits vergeben");
        }

        User newUser = new User(
                registrationDto.getGenderEnum(),
                registrationDto.getFirstName(),
                registrationDto.getLastName(),
                lowerCaseUsername,
                lowerCaseEmail,
                passwordEncoder.encode(registrationDto.getPassword()));

        return userRepository.save(newUser);
    }

    public static class UserRegistrationException extends RuntimeException {
        public UserRegistrationException(String message) {
            super(message);
        }
    }

    public void initiatePasswordReset(String userEmail) throws RateLimitException {
        String lowerCaseEmail = userEmail.toLowerCase(Locale.ROOT);

        Long lastRequestTimestamp = passwordResetRateLimitCache.getIfPresent(lowerCaseEmail);
        if (lastRequestTimestamp != null) {
            long currentTime = System.currentTimeMillis();
            long cooldownMillis = TimeUnit.MINUTES.toMillis(2);
            long timePassed = currentTime - lastRequestTimestamp;
            long timeLeftMillis = cooldownMillis - timePassed;

            if (timeLeftMillis > 0) {
                long retryAfterSeconds = TimeUnit.MILLISECONDS.toSeconds(timeLeftMillis) + 1;
                logger.warn(
                        "Passwortzurücksetzungsanfrage für E-Mail {} rate-begrenzt. Erneut versuchen in {} Sekunden.",
                        lowerCaseEmail, retryAfterSeconds);
                throw new RateLimitException(
                        "Zu viele Anfragen. Bitte warten Sie.",
                        retryAfterSeconds);
            } else {
                passwordResetRateLimitCache.invalidate(lowerCaseEmail);
                logger.warn("Veralteter Rate-Limit-Cache-Eintrag für E-Mail {} ungültig gemacht.", lowerCaseEmail);
            }
        }

        passwordResetRateLimitCache.put(lowerCaseEmail, System.currentTimeMillis());
        logger.debug("Rate-Limit-Cache für E-Mail {} aktualisiert.", lowerCaseEmail);

        Optional<User> userOptional = userRepository.findByEmail(lowerCaseEmail);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String token = jwtService.generatePasswordResetToken(user.getUsername());
            emailService.sendPasswordResetEmail(user.getEmail(), token);
            logger.info("Passwortzurücksetzung für Benutzer {} initiiert", user.getUsername());
        } else {
            logger.warn("Passwortzurücksetzungsversuch für nicht vorhandene E-Mail: {}", lowerCaseEmail);
        }
    }

    public void resetPassword(String token, String newPassword) {
        String username;
        try {
            username = jwtService.extractUsername(token);
        } catch (Exception e) {
            logger.warn("Versuch, das Passwort mit einem ungültigen Token zurückzusetzen (Fehler beim Extrahieren): {}", token);
            throw new IllegalArgumentException("Ungültiger oder abgelaufener Passwortzurücksetzungstoken.");
        }

        if (username == null) {
             logger.warn("Versuch, das Passwort mit einem Token ohne Benutzer zurückzusetzen: {}", token);
            throw new IllegalArgumentException("Ungültiger Passwortzurücksetzungstoken.");
        }

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> {
                 logger.error("Benutzer '{}' aus dem Passwortzurücksetzungstoken nicht gefunden.", username);
                 return new IllegalArgumentException("Ungültiger Passwortzurücksetzungstoken.");
            });

         if (!jwtService.isPasswordResetTokenValid(token, username)) {
             logger.warn("Ungültiger oder abgelaufener Passwortzurücksetzungstoken für Benutzer '{}'", username);
             throw new IllegalArgumentException("Ungültiger oder abgelaufener Passwortzurücksetzungstoken.");
         }

        if (newPassword == null || newPassword.length() < 8) {
             throw new IllegalArgumentException("Das Passwort muss mindestens 8 Zeichen lang sein.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logger.info("Passwort für Benutzer '{}' erfolgreich zurückgesetzt.", username);

    }
}