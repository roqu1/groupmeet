package com.groupmeet.application.service;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import com.groupmeet.application.dto.UserRegistrationDto;
import com.groupmeet.application.model.User;
import com.groupmeet.application.repository.UserRepository;

import jakarta.validation.Valid;

@Service
@Validated
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
                passwordEncoder.encode(registrationDto.getPassword())
        );

        return userRepository.save(newUser);
    }

    public static class UserRegistrationException extends RuntimeException {
        public UserRegistrationException(String message) {
            super(message);
        }
    }
}