package com.groupmeet.application.controller;

import com.groupmeet.application.dto.UserProfileDto;
import com.groupmeet.application.model.Interest;
import com.groupmeet.application.model.User;
import com.groupmeet.application.repository.InterestRepository;
import com.groupmeet.application.repository.UserRepository;
import com.groupmeet.application.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/profile")
public class UserProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    // This dependency injection allows us to use the sophisticated bulk lookup methods
    // that your InterestRepository provides for optimal database performance
    @Autowired
    private InterestRepository interestRepository;

    @GetMapping
    public ResponseEntity<?> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthController.ErrorResponse("Not authenticated"));
        }

        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AuthController.ErrorResponse("User not found"));
        }

        User user = userOptional.get();
        UserProfileDto profileDto = new UserProfileDto();
        profileDto.setFirstName(user.getFirstName());
        profileDto.setLastName(user.getLastName());
        profileDto.setLocation(user.getLocation());
        profileDto.setAboutMe(user.getAboutMe());

        // Convert the rich Interest entities to simple string names for the API response
        // This transformation provides a clean separation between internal data structures
        // and external API contracts, which is a fundamental principle in API design
        List<String> interestNames = user.getInterests().stream()
                .map(Interest::getName)  // Extract just the name from each Interest entity
                .collect(Collectors.toList());
        profileDto.setInterests(interestNames);

        // Use the correct field name that matches your User model and maintains
        // consistency with roqu1's requirement to preserve existing naming conventions
        profileDto.setAvatarUrl(user.getAvatarUrl());

        return ResponseEntity.ok(profileDto);
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUserProfile(
            @RequestPart("firstName") String firstName,
            @RequestPart("lastName") String lastName,
            @RequestPart(value = "location", required = false) String location,
            @RequestPart(value = "aboutMe", required = false) String aboutMe,
            @RequestPart(value = "interests", required = false) String interestsJson,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthController.ErrorResponse("Not authenticated"));
        }

        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AuthController.ErrorResponse("User not found"));
        }

        User user = userOptional.get();
        // Update basic profile information with proper null checking
        // This approach ensures that only provided fields are updated while
        // maintaining existing data for fields that weren't included in the request
        user.setFirstName(firstName);
        user.setLastName(lastName);

        if (location != null) {
            user.setLocation(location);
        }

        if (aboutMe != null) {
            user.setAboutMe(aboutMe);
        }

        // Handle interest updates using the sophisticated conversion logic
        // This demonstrates how to bridge between simple API data and complex entity relationships
        if (interestsJson != null && !interestsJson.isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                List<String> interestNames = objectMapper.readValue(interestsJson,
                        new TypeReference<List<String>>(){});

                // Convert interest names to Interest entities using our optimized bulk lookup approach
                // This leverages your repository's advanced capabilities for maximum efficiency
                Set<Interest> interests = convertInterestNamesToEntities(interestNames);
                user.setInterests(interests);
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                        .body(new AuthController.ErrorResponse("Invalid interests format"));
            }
        }

        // Process profile image upload using the improved FileStorageService
        // This implements roqu1's requirement for user ID-based naming and automatic cleanup
        if (profileImage != null && profileImage.getSize() > 0) {
            try {
                String imageUrl = fileStorageService.storeProfileImage(profileImage, user.getId());
                // Use the correct method name that maintains consistency with your User model
                user.setAvatarUrl(imageUrl);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new AuthController.ErrorResponse("Failed to upload profile image"));
            }
        }

        userRepository.save(user);

        // Construct the response DTO with the same conversion logic used in the GET endpoint
        // This ensures consistency between different API operations and prevents confusion
        UserProfileDto updatedProfile = new UserProfileDto();
        updatedProfile.setFirstName(user.getFirstName());
        updatedProfile.setLastName(user.getLastName());
        updatedProfile.setLocation(user.getLocation());
        updatedProfile.setAboutMe(user.getAboutMe());

        // Convert the updated interests back to string format for the API response
        List<String> responseInterestNames = user.getInterests().stream()
                .map(Interest::getName)
                .collect(Collectors.toList());
        updatedProfile.setInterests(responseInterestNames);

        // Ensure the response includes the correct avatar field name
        updatedProfile.setAvatarUrl(user.getAvatarUrl());

        return ResponseEntity.ok(updatedProfile);
    }

    /**
     * This helper method demonstrates advanced database optimization techniques
     * by using bulk lookups instead of individual queries for each interest.
     *
     * The method leverages your InterestRepository's sophisticated findByNameInIgnoreCase
     * method to retrieve all existing interests in a single database query, which is
     * significantly more efficient than making separate calls for each interest name.
     *
     * Additionally, it handles the creation of new Interest entities for names that
     * don't exist yet, allowing your interest vocabulary to grow dynamically while
     * maintaining referential integrity in your database.
     */
    private Set<Interest> convertInterestNamesToEntities(List<String> interestNames) {
        // Use the efficient bulk lookup method to find all existing interests in one query
        // This approach demonstrates proper use of repository capabilities and minimizes database load
        Set<Interest> existingInterests = interestRepository.findByNameInIgnoreCase(interestNames);

        // Create a set of names that were successfully found in the database
        // This allows us to identify which interest names need to be created as new entities
        Set<String> foundInterestNames = existingInterests.stream()
                .map(interest -> interest.getName().toLowerCase()) // Normalize for comparison
                .collect(Collectors.toSet());

        // Start with all the interests we found in the database
        Set<Interest> allInterests = new HashSet<>(existingInterests);

        // Create new Interest entities for any names that weren't found in the database
        // This approach allows your system to evolve its interest vocabulary organically
        for (String interestName : interestNames) {
            boolean alreadyExists = foundInterestNames.contains(interestName.toLowerCase());

            if (!alreadyExists) {
                // Create and save a new Interest entity for vocabulary expansion
                // This maintains data integrity while allowing dynamic growth
                Interest newInterest = new Interest();
                newInterest.setName(interestName);
                Interest savedInterest = interestRepository.save(newInterest);
                allInterests.add(savedInterest);
            }
        }

        return allInterests;
    }
}