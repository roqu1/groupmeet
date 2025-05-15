package com.groupmeet.application.model;

public enum Gender {
    MALE("männlich"),
    FEMALE("weiblich"),
    DIVERS("divers");

    private final String displayName;

    Gender(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Gender fromDisplayName(String displayName) {
        for (Gender gender : values()) {
            if (gender.getDisplayName().equalsIgnoreCase(displayName)) {
                return gender;
            }
        }

        try {
            return Gender.valueOf(displayName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown gender: " + displayName);
        }
    }
}