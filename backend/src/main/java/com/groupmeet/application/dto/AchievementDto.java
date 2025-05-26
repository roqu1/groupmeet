package com.groupmeet.application.dto;

public class AchievementDto {
    private String name;
    private String description;
    private String iconName;

    public AchievementDto(String name, String description, String iconName) {
        this.name = name;
        this.description = description;
        this.iconName = iconName;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getIconName() {
        return iconName;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setIconName(String iconName) {
        this.iconName = iconName;
    }
}