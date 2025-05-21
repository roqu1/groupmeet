package com.groupmeet.application.repository;

import com.groupmeet.application.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    /**
     * Finds a Location by its name, ignoring case.
     *
     * @param name the name of the location to find
     * @return an Optional containing the found Location, or empty if not found
     */
    Optional<Location> findByNameIgnoreCase(String name);
}