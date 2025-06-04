package com.groupmeet.application.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "username")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Geschlecht ist erforderlich")
    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @NotBlank(message = "Vorname ist erforderlich")
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank(message = "Nachname ist erforderlich")
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @NotBlank(message = "Benutzername ist erforderlich")
    @Size(min = 4, message = "Benutzername muss mindestens 4 Zeichen lang sein")
    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @NotBlank(message = "E-Mail ist erforderlich")
    @Email(message = "Ungültiges E-Mail-Format")
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Passwort ist erforderlich")
    @Size(min = 8, message = "Das Passwort muss mindestens 8 Zeichen lang sein")
    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "location")
    private String location;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "about_me", columnDefinition = "TEXT")
    private String aboutMe;

    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "interest_id"))
    private Set<Interest> interests = new HashSet<>();

    @Column(name = "is_pro", nullable = false, columnDefinition = "boolean default false")
    private boolean isPro = false;

    public User() {
        this.createdAt = LocalDateTime.now();
    }

    public User(Gender gender, String firstName, String lastName, String username, String email, String password) {
        this.gender = gender;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = LocalDateTime.now();
        this.isPro = false; // Default for new users
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getAboutMe() {
        return aboutMe;
    }

    public void setAboutMe(String aboutMe) {
        this.aboutMe = aboutMe;
    }

    public Set<Interest> getInterests() {
        return interests;
    }

    public void setInterests(Set<Interest> interests) {
        this.interests = interests;
    }

    public void addInterest(Interest interest) {
        this.interests.add(interest);
        interest.getUsers().add(this);
    }

    public void removeInterest(Interest interest) {
        this.interests.remove(interest);
        interest.getUsers().remove(this);
    }

    public boolean isPro() {
        return isPro;
    }

    public void setPro(boolean pro) {
        isPro = pro;
    }
}