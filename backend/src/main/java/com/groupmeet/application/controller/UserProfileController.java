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
        profileDto.setId(user.getId());
        profileDto.setFirstName(user.getFirstName());
        profileDto.setLastName(user.getLastName());
        profileDto.setLocation(user.getLocation());
        profileDto.setAboutMe(user.getAboutMe());

        List<String> interestNames = user.getInterests().stream()
                .map(Interest::getName)
                .collect(Collectors.toList());
        profileDto.setInterests(interestNames);

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
        user.setFirstName(firstName);
        user.setLastName(lastName);

        if (location != null) {
            user.setLocation(location);
        }

        if (aboutMe != null) {
            user.setAboutMe(aboutMe);
        }

        if (interestsJson != null && !interestsJson.isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                List<String> interestNames = objectMapper.readValue(interestsJson,
                        new TypeReference<List<String>>(){});

                Set<Interest> interests = convertInterestNamesToEntities(interestNames);
                user.setInterests(interests);
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                        .body(new AuthController.ErrorResponse("Invalid interests format"));
            }
        }

        if (profileImage != null && profileImage.getSize() > 0) {
            try {
                String imageUrl = fileStorageService.storeProfileImage(profileImage, user.getId());
                user.setAvatarUrl(imageUrl);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new AuthController.ErrorResponse("Failed to upload profile image"));
            }
        }

        userRepository.save(user);

        UserProfileDto updatedProfile = new UserProfileDto();
        updatedProfile.setFirstName(user.getFirstName());
        updatedProfile.setLastName(user.getLastName());
        updatedProfile.setLocation(user.getLocation());
        updatedProfile.setAboutMe(user.getAboutMe());

        List<String> responseInterestNames = user.getInterests().stream()
                .map(Interest::getName)
                .collect(Collectors.toList());
        updatedProfile.setInterests(responseInterestNames);

        updatedProfile.setAvatarUrl(user.getAvatarUrl());

        return ResponseEntity.ok(updatedProfile);
    }

    private Set<Interest> convertInterestNamesToEntities(List<String> interestNames) {
        Set<Interest> existingInterests = interestRepository.findByNameInIgnoreCase(interestNames);

        Set<String> foundInterestNames = existingInterests.stream()
                .map(interest -> interest.getName().toLowerCase())
                .collect(Collectors.toSet());

        Set<Interest> allInterests = new HashSet<>(existingInterests);

        for (String interestName : interestNames) {
            boolean alreadyExists = foundInterestNames.contains(interestName.toLowerCase());

            if (!alreadyExists) {
                Interest newInterest = new Interest();
                newInterest.setName(interestName);
                Interest savedInterest = interestRepository.save(newInterest);
                allInterests.add(savedInterest);
            }
        }

        return allInterests;
    }
}