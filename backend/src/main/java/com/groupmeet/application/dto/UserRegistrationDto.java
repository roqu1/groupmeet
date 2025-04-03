package com.groupmeet.application.dto;

import com.groupmeet.application.model.Gender;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserRegistrationDto {
    @NotBlank(message = "Geschlecht ist erforderlich")
    private String gender;

    @NotBlank(message = "Vorname ist erforderlich")
    private String firstName;

    @NotBlank(message = "Nachname ist erforderlich")
    private String lastName;

    @NotBlank(message = "Benutzername ist erforderlich")
    private String username;

    @NotBlank(message = "E-Mail ist erforderlich")
    @Email(message = "Ungültiges E-Mail-Format")
    private String email;

    @NotBlank(message = "Passwort ist erforderlich")
    @Size(min = 8, message = "Das Passwort muss mindestens 8 Zeichen lang sein")
    private String password;

    public UserRegistrationDto() {}

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public Gender getGenderEnum() {
        return Gender.fromDisplayName(gender);
    }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}