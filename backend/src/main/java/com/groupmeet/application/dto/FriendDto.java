package com.groupmeet.application.dto;

import com.groupmeet.application.model.User;

public class FriendDto {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String avatarUrl;

    public FriendDto(Long id, String username, String firstName, String lastName, String avatarUrl) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.avatarUrl = avatarUrl;
    }

    public static FriendDto fromUser(User user) {
        return new FriendDto(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getAvatarUrl()
        );
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }
}