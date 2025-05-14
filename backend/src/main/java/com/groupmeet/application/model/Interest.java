package com.groupmeet.application.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "interests")
public class Interest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String name;

    @ManyToMany(mappedBy = "interests")
    private Set<User> users = new HashSet<>();

    public Interest() {
    }

    public Interest(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Interest interest = (Interest) o;
        return Objects.equals(name, interest.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }
}