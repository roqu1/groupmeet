package com.groupmeet.application.fixture;

import com.groupmeet.application.dto.UserRegistrationDto;
import com.groupmeet.application.model.Gender;
import com.groupmeet.application.model.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Fixture for creating test users
 */
public class UserFixture {
    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Creates a test male user
     * 
     * @param suffix suffix for unique fields (email, username)
     * @return user
     */
    public static User createTestMaleUser(String suffix) {
        return new User(
                Gender.MALE,
                "TestFirstName" + suffix,
                "TestLastName" + suffix,
                "testuser" + suffix,
                "test" + suffix + "@example.com",
                passwordEncoder.encode("Password123!"));
    }

    /**
     * Creates a test female user
     * 
     * @param suffix suffix for unique fields (email, username)
     * @return user
     */
    public static User createTestFemaleUser(String suffix) {
        return new User(
                Gender.FEMALE,
                "TestFirstName" + suffix,
                "TestLastName" + suffix,
                "testuser" + suffix,
                "test" + suffix + "@example.com",
                passwordEncoder.encode("Password123!"));
    }

    /**
     * Creates a DTO for male user registration
     * 
     * @param suffix suffix for unique fields (email, username)
     * @return user registration DTO
     */
    public static UserRegistrationDto createTestMaleUserRegistrationDto(String suffix) {
        UserRegistrationDto dto = new UserRegistrationDto();
        dto.setGender("männlich");
        dto.setFirstName("TestFirstName" + suffix);
        dto.setLastName("TestLastName" + suffix);
        dto.setUsername("testuser" + suffix);
        dto.setEmail("test" + suffix + "@example.com");
        dto.setPassword("Password123!");
        return dto;
    }

    /**
     * Creates a DTO for female user registration
     * 
     * @param suffix suffix for unique fields (email, username)
     * @return user registration DTO
     */
    public static UserRegistrationDto createTestFemaleUserRegistrationDto(String suffix) {
        UserRegistrationDto dto = new UserRegistrationDto();
        dto.setGender("weiblich");
        dto.setFirstName("TestFirstName" + suffix);
        dto.setLastName("TestLastName" + suffix);
        dto.setUsername("testuser" + suffix);
        dto.setEmail("test" + suffix + "@example.com");
        dto.setPassword("Password123!");
        return dto;
    }
}