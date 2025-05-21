package com.groupmeet.application.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    // Define supported image extensions for cleanup operations
    private static final List<String> SUPPORTED_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"
    );

    /**
     * Stores profile image using user ID-based naming and removes old images
     * This implements roqu1's requirement: "Save the pictures with id of user in the folder
     * and when the image will be changed, then remove the old image and save the new one"
     */
    public String storeProfileImage(MultipartFile file, Long userId) throws IOException {
        // Create profiles directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, "profiles");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Extract file extension from uploaded file
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null && originalFilename.contains(".") ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";

        // Create predictable filename using user ID: profile_[userId].[extension]
        String fileName = "profile_" + userId + fileExtension;
        Path targetLocation = uploadPath.resolve(fileName);

        // Remove any existing profile image for this user before saving new one
        deleteExistingProfileImage(userId, uploadPath);

        // Save the new image file
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return URL path for frontend access
        return "/uploads/profiles/" + fileName;
    }

    /**
     * Removes existing profile image for a user across all supported formats
     * This handles cases where user previously uploaded different image formats
     */
    private void deleteExistingProfileImage(Long userId, Path uploadPath) {
        for (String extension : SUPPORTED_EXTENSIONS) {
            Path existingImagePath = uploadPath.resolve("profile_" + userId + extension);
            if (Files.exists(existingImagePath)) {
                try {
                    Files.delete(existingImagePath);
                    System.out.println("Deleted existing profile image: " + existingImagePath.getFileName());
                    break; // Only delete first match since user should have one image
                } catch (IOException e) {
                    System.err.println("Warning: Failed to delete existing image: " + e.getMessage());
                }
            }
        }
    }

    /**
     * Completely removes a user's profile image (useful for account deletion)
     */
    public boolean deleteUserProfileImage(Long userId) {
        if (userId == null) {
            return false;
        }

        try {
            Path uploadPath = Paths.get(uploadDir, "profiles");

            for (String extension : SUPPORTED_EXTENSIONS) {
                Path imagePath = uploadPath.resolve("profile_" + userId + extension);
                if (Files.exists(imagePath)) {
                    Files.delete(imagePath);
                    return true;
                }
            }
            return false;
        } catch (IOException e) {
            System.err.println("Error deleting profile image for user " + userId + ": " + e.getMessage());
            return false;
        }
    }
}