package com.groupmeet.application.dto;

import com.groupmeet.application.model.Gender;
import com.groupmeet.application.model.Interest;
import com.groupmeet.application.model.User;

import java.util.List;
import java.util.stream.Collectors;

public class UserSearchResultDto {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private Gender gender;
    private String avatarUrl;
    private String location;
    private List<String> interests;
    private String friendshipStatus;

    public UserSearchResultDto() {
    }

    public static UserSearchResultDto fromUser(User user, String friendshipStatus) {
        UserSearchResultDto dto = new UserSearchResultDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setGender(user.getGender());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setLocation(user.getLocation());

        if (user.getInterests() != null) {
            dto.setInterests(user.getInterests().stream().map(Interest::getName).collect(Collectors.toList()));
        }
        dto.setFriendshipStatus(friendshipStatus);
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public String getFriendshipStatus() {
        return friendshipStatus;
    }

    public void setFriendshipStatus(String friendshipStatus) {
        this.friendshipStatus = friendshipStatus;
    }
}