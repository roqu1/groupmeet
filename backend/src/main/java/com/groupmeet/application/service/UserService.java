package com.groupmeet.application.service;

import com.groupmeet.application.dto.UserRegistrationDto;
import com.groupmeet.application.model.User;
import com.groupmeet.application.repository.UserRepository;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

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
        // Check if email already exists
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new UserRegistrationException("Email already registered");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            throw new UserRegistrationException("Username already taken");
        }

        // Create new user
        User newUser = new User(
                registrationDto.getGender(),
                registrationDto.getFirstName(),
                registrationDto.getLastName(),
                registrationDto.getUsername(),
                registrationDto.getEmail(),
                // Encrypt password
                passwordEncoder.encode(registrationDto.getPassword())
        );

        // Save user
        return userRepository.save(newUser);
    }

    // Custom exception for registration errors
    public static class UserRegistrationException extends RuntimeException {
        public UserRegistrationException(String message) {
            super(message);
        }
    }
}