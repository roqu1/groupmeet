package com.groupmeet.application.service;

import com.groupmeet.application.dto.UserRegistrationDto;
import com.groupmeet.application.model.User;
import com.groupmeet.application.repository.UserRepository;
import jakarta.validation.Valid;
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
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new UserRegistrationException("E-Mail ist bereits registriert");
        }

        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            throw new UserRegistrationException("Benutzername ist bereits vergeben");
        }


        User newUser = new User(
                registrationDto.getGenderEnum(),
                registrationDto.getFirstName(),
                registrationDto.getLastName(),
                registrationDto.getUsername(),
                registrationDto.getEmail(),
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