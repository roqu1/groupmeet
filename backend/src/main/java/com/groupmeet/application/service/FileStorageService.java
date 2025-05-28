package com.groupmeet.application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    private static final List<String> SUPPORTED_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp");

    public String storeProfileImage(MultipartFile file, Long userId) throws IOException {
        Path profilesUploadPath = Paths.get(uploadDir, "profiles");
        logger.debug("Upload directory from config: {}", uploadDir);
        logger.debug("Absolute profiles upload path: {}", profilesUploadPath.toAbsolutePath().toString());

        if (!Files.exists(profilesUploadPath)) {
            try {
                Files.createDirectories(profilesUploadPath);
            } catch (IOException e) {
                logger.error("Failed to create profiles directory: {}", profilesUploadPath, e);
                throw e;
            }
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension;

        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            if (!SUPPORTED_EXTENSIONS.contains(fileExtension)) {
                logger.warn("Invalid file type for userId: {}. Extension: {}. Original filename: {}", userId, fileExtension, originalFilename);
                throw new IOException("Ungültiger Dateityp. Nur " + String.join(", ", SUPPORTED_EXTENSIONS) + " sind erlaubt.");
            }
        } else {
            logger.warn("File for userId: {} has no valid extension or is not a supported image type. Original filename: {}", userId, originalFilename);
            throw new IOException("Dateiname hat keine gültige Erweiterung oder ist kein unterstützter Bildtyp.");
        }

        String fileName = "profile_" + userId + fileExtension;
        Path targetLocation = profilesUploadPath.resolve(fileName);

        deleteExistingProfileImage(userId, profilesUploadPath);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            logger.error("Failed to store profile image for userId {} at {}: {}", userId, targetLocation, e.getMessage(), e);
            throw e;
        }
        
        String imageUrl = "/uploads/profiles/" + fileName;
        return imageUrl;
    }

    private void deleteExistingProfileImage(Long userId, Path uploadPath) {
        logger.debug("Attempting to delete existing profile images for userId: {} in path: {}", userId, uploadPath.toAbsolutePath().toString());
        boolean deletedAny = false;
        for (String extension : SUPPORTED_EXTENSIONS) {
            Path existingImagePath = uploadPath.resolve("profile_" + userId + extension);
            if (Files.exists(existingImagePath)) {
                try {
                    Files.delete(existingImagePath);
                    deletedAny = true;
                    break; 
                } catch (IOException e) {
                    logger.warn("Warning: Failed to delete existing image: {}. Error: {}", existingImagePath, e.getMessage());
                }
            }
        }
        if (!deletedAny) {
        }
    }

    public boolean deleteUserProfileImage(Long userId) {
        if (userId == null) {
            logger.warn("Attempted to delete profile image for null userId.");
            return false;
        }
        try {
            Path profilesUploadPath = Paths.get(uploadDir, "profiles");
            boolean deletedAny = false;
            for (String extension : SUPPORTED_EXTENSIONS) {
                Path imagePath = profilesUploadPath.resolve("profile_" + userId + extension);
                if (Files.exists(imagePath)) {
                    Files.delete(imagePath);
                    deletedAny = true; 
                    break;
                }
            }
            if (!deletedAny) {
            }
            return deletedAny;
        } catch (IOException e) {
            logger.error("Error deleting profile image(s) for user " + userId + ": " + e.getMessage(), e);
            return false;
        }
    }
}
