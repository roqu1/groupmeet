package com.groupmeet.application.dto;

import com.groupmeet.application.model.Gender;
import java.util.List;

public class UserProfileDto {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private Gender gender;
    private String avatarUrl;
    private String location;
    private Integer age;
    private String aboutMe;
    private List<String> interests;
    private List<AchievementDto> achievements;
    private ProfileFriendshipStatus friendshipStatusWithViewer;
    private Long relatedFriendshipId;
    private int friendsCount;
    private List<FriendSummaryDto> friendPreviews;
    private Integer pendingFriendRequestsCount;
    private boolean isPro; // New field

    public UserProfileDto() {
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

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getAboutMe() {
        return aboutMe;
    }

    public void setAboutMe(String aboutMe) {
        this.aboutMe = aboutMe;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public List<AchievementDto> getAchievements() {
        return achievements;
    }

    public void setAchievements(List<AchievementDto> achievements) {
        this.achievements = achievements;
    }

    public ProfileFriendshipStatus getFriendshipStatusWithViewer() {
        return friendshipStatusWithViewer;
    }

    public void setFriendshipStatusWithViewer(ProfileFriendshipStatus friendshipStatusWithViewer) {
        this.friendshipStatusWithViewer = friendshipStatusWithViewer;
    }

    public Long getRelatedFriendshipId() {
        return relatedFriendshipId;
    }

    public void setRelatedFriendshipId(Long relatedFriendshipId) {
        this.relatedFriendshipId = relatedFriendshipId;
    }

    public int getFriendsCount() {
        return friendsCount;
    }

    public void setFriendsCount(int friendsCount) {
        this.friendsCount = friendsCount;
    }

    public List<FriendSummaryDto> getFriendPreviews() {
        return friendPreviews;
    }

    public void setFriendPreviews(List<FriendSummaryDto> friendPreviews) {
        this.friendPreviews = friendPreviews;
    }

    public Integer getPendingFriendRequestsCount() {
        return pendingFriendRequestsCount;
    }

    public void setPendingFriendRequestsCount(Integer pendingFriendRequestsCount) {
        this.pendingFriendRequestsCount = pendingFriendRequestsCount;
    }

    public boolean isPro() {
        return isPro;
    }

    public void setPro(boolean pro) {
        isPro = pro;
    }
}