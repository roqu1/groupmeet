package com.groupmeet.application.dto;

// This is user data returned after successful login/registration or for /me endpoint
public class AuthResponseDto {
    private Long id;
    private String gender;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String createdAt;
    private boolean isPro;

    public AuthResponseDto(Long id, String gender, String firstName, String lastName, String username, String email, String createdAt, boolean isPro) {
        this.id = id;
        this.gender = gender;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.createdAt = createdAt;
        this.isPro = isPro;
    }

    public static AuthResponseDto fromUser(com.groupmeet.application.model.User user) {
        return new AuthResponseDto(
                user.getId(),
                user.getGender().name(),
                user.getFirstName(),
                user.getLastName(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null,
                user.isPro()
        );
    }

    public Long getId() { return id; }
    public String getGender() { return gender; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getCreatedAt() { return createdAt; }
    public boolean isPro() { return isPro; }
}