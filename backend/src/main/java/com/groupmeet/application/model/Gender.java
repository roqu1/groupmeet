package com.groupmeet.application.model;

public enum Gender {
    MALE("männlich"),
    FEMALE("weiblich");

    private final String displayName;

    Gender(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Gender fromDisplayName(String displayName) {
        for (Gender gender : values()) {
            if (gender.getDisplayName().equals(displayName)) {
                return gender;
            }
        }
        throw new IllegalArgumentException("Unknown gender: " + displayName);
    }
}