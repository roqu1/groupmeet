package com.groupmeet.application.repository;

import com.groupmeet.application.model.Interest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface InterestRepository extends JpaRepository<Interest, Long> {
    Optional<Interest> findByNameIgnoreCase(String name);
    Set<Interest> findByNameInIgnoreCase(List<String> names);
}