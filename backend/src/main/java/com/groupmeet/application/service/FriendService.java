package com.groupmeet.application.service;

import com.groupmeet.application.dto.FriendDto;
import com.groupmeet.application.model.Friendship;
import com.groupmeet.application.model.FriendshipStatus;
import com.groupmeet.application.model.User;
import com.groupmeet.application.repository.FriendshipRepository;
import com.groupmeet.application.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Objects;
import java.util.Optional;

@Service
public class FriendService {

    private static final Logger logger = LoggerFactory.getLogger(FriendService.class);

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<FriendDto> getFriends(String currentUsername, String searchTerm, Pageable pageable) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> {
                    logger.warn("Versuch, Freunde für einen nicht existierenden Benutzer abzurufen: {}",
                            currentUsername);
                    return new UsernameNotFoundException("Benutzer nicht gefunden: " + currentUsername);
                });

        logger.info("Freundschaften für Benutzer {} mit Suchbegriff '{}' und Seitenanfrage {} abrufen",
                currentUsername, searchTerm, pageable);

        Page<Friendship> friendshipsPage;
        if (StringUtils.hasText(searchTerm)) {
            friendshipsPage = friendshipRepository.findFriendshipsByUserAndStatusAndSearchTerm(
                    currentUser, FriendshipStatus.ACCEPTED, searchTerm, pageable);
        } else {
            friendshipsPage = friendshipRepository.findFriendshipsByUserAndStatus(
                    currentUser, FriendshipStatus.ACCEPTED, pageable);
        }

        logger.info("Es wurden {} Freundschaften für Benutzer {} gefunden. Gesamte Elemente: {}, Gesamte Seiten: {}",
                friendshipsPage.getNumberOfElements(), currentUsername, friendshipsPage.getTotalElements(),
                friendshipsPage.getTotalPages());

        final User finalCurrentUser = currentUser;
        Page<User> friendUsersPage = friendshipsPage.map(friendship -> {
            if (Objects.equals(friendship.getUserOne().getId(), finalCurrentUser.getId())) {
                return friendship.getUserTwo();
            }
            return friendship.getUserOne();
        });

        return friendUsersPage.map(FriendDto::fromUser);
    }

    @Transactional
    public void removeFriend(String currentUsername, Long friendIdToRemove) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(
                        () -> new UsernameNotFoundException("Aktueller Benutzer nicht gefunden: " + currentUsername));

        User friendToRemove = userRepository.findById(friendIdToRemove)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Zu entfernender Freund nicht gefunden mit ID: " + friendIdToRemove));

        if (currentUser.getId().equals(friendToRemove.getId())) {
            logger.warn("Benutzer {} hat versucht, sich selbst als Freund zu entfernen.", currentUsername);
            throw new IllegalArgumentException("Du kannst dich nicht selbst als Freund entfernen.");
        }

        Optional<Friendship> friendshipOpt = friendshipRepository.findFriendshipBetweenUsersWithStatus(
                currentUser, friendToRemove, FriendshipStatus.ACCEPTED);

        if (friendshipOpt.isPresent()) {
            friendshipRepository.delete(friendshipOpt.get());
            logger.info("Benutzer {} hat Freund {}(ID:{}) entfernt", currentUsername, friendToRemove.getUsername(),
                    friendIdToRemove);
        } else {
            logger.warn("Keine akzeptierte Freundschaft zwischen {} und {}(ID:{}) gefunden, um sie zu entfernen.",
                    currentUsername, friendToRemove.getUsername(), friendIdToRemove);
            throw new FriendNotFoundException(
                    "Keine aktive Freundschaft mit Benutzer-ID gefunden: " + friendIdToRemove);
        }
    }

    public static class FriendNotFoundException extends RuntimeException {
        public FriendNotFoundException(String message) {
            super(message);
        }
    }
}