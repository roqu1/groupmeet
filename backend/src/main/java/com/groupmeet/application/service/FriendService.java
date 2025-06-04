package com.groupmeet.application.service;

import com.groupmeet.application.dto.FriendDto;
import com.groupmeet.application.dto.FriendRequestDto;
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
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;
import java.util.Optional;

@Service
public class FriendService {

    private static final Logger logger = LoggerFactory.getLogger(FriendService.class);

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private UserRepository userRepository;

    private static final int MAX_FRIENDS_FOR_FREE_USER = 10;

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
        return friendshipsPage.map(friendship -> {
            User friendUser = Objects.equals(friendship.getUserOne().getId(), finalCurrentUser.getId())
                    ? friendship.getUserTwo()
                    : friendship.getUserOne();
            return FriendDto.fromUser(friendUser);
        });
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

    @Transactional
    public void sendFriendRequest(String currentUsername, Long targetUserId) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(
                        () -> new UsernameNotFoundException("Aktueller Benutzer nicht gefunden: " + currentUsername));
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(
                        () -> new UsernameNotFoundException("Zielbenutzer nicht gefunden mit ID: " + targetUserId));

        if (currentUser.getId().equals(targetUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Du kannst dir nicht selbst eine Freundschaftsanfrage senden.");
        }

        Optional<Friendship> existingFriendship = friendshipRepository
                .findFriendshipBetweenUsers(currentUser, targetUser);

        if (existingFriendship.isPresent()) {
            Friendship fs = existingFriendship.get();
            if (fs.getStatus() == FriendshipStatus.ACCEPTED) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ihr seid bereits Freunde.");
            } else if (fs.getStatus() == FriendshipStatus.PENDING) {
                if (fs.getUserOne().getId().equals(currentUser.getId())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Du hast diesem Benutzer bereits eine Anfrage gesendet.");
                } else {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Dieser Benutzer hat dir bereits eine Anfrage gesendet. Du kannst sie annehmen.");
                }
            } else if (fs.getStatus() == FriendshipStatus.DECLINED || fs.getStatus() == FriendshipStatus.BLOCKED) {
                if (fs.getStatus() == FriendshipStatus.DECLINED)
                    friendshipRepository.delete(fs);
                else if (fs.getStatus() == FriendshipStatus.BLOCKED) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "Interaktion mit diesem Benutzer ist nicht möglich.");
                }
            }
        }

        if (!currentUser.isPro()) {
            long friendCountSender = friendshipRepository.countAcceptedFriendsForUser(currentUser);
            if (friendCountSender >= MAX_FRIENDS_FOR_FREE_USER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Du hast das Limit von "
                        + MAX_FRIENDS_FOR_FREE_USER
                        + " Freunden für kostenlose Konten erreicht. Upgrade auf Pro, um mehr Freunde hinzuzufügen.");
            }
        }
        if (!targetUser.isPro()) {
            long friendCountTarget = friendshipRepository.countAcceptedFriendsForUser(targetUser);
            if (friendCountTarget >= MAX_FRIENDS_FOR_FREE_USER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Dieser Benutzer hat das Limit für kostenlose Konten von " + MAX_FRIENDS_FOR_FREE_USER
                                + " Freunden erreicht und kann keine weiteren Anfragen annehmen.");
            }
        }

        Friendship newRequest = new Friendship(currentUser, targetUser, FriendshipStatus.PENDING);
        friendshipRepository.save(newRequest);
        logger.info("Benutzer {} hat eine Freundschaftsanfrage an Benutzer {} (ID:{}) gesendet", currentUsername,
                targetUser.getUsername(), targetUserId);
    }

    @Transactional(readOnly = true)
    public Page<FriendRequestDto> getIncomingFriendRequests(String currentUsername, Pageable pageable) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + currentUsername));

        Page<Friendship> pendingFriendships = friendshipRepository
                .findByUserTwoAndStatusOrderByCreatedAtDesc(currentUser, FriendshipStatus.PENDING, pageable);

        return pendingFriendships.map(friendship -> new FriendRequestDto(
                friendship.getId(),
                friendship.getUserOne(),
                friendship.getCreatedAt()));
    }

    @Transactional
    public void acceptFriendRequest(String currentUsername, Long requestId) {
        User currentUser = userRepository.findByUsername(currentUsername) // This is userTwo, the acceptor
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + currentUsername));

        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new FriendRequestNotFoundException(
                        "Freundschaftsanfrage mit ID " + requestId + " nicht gefunden."));

        if (!friendship.getUserTwo().getId().equals(currentUser.getId())
                || friendship.getStatus() != FriendshipStatus.PENDING) {
            logger.warn("Versuch, eine ungültige oder nicht zu Benutzer {} gehörende Anfrage ID {} anzunehmen",
                    currentUsername, requestId);
            throw new InvalidFriendRequestOperationException("Die Anfrage kann nicht angenommen werden.");
        }

        if (!currentUser.isPro()) {
            long friendCountAcceptor = friendshipRepository.countAcceptedFriendsForUser(currentUser);
            if (friendCountAcceptor >= MAX_FRIENDS_FOR_FREE_USER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Du hast das Limit von " + MAX_FRIENDS_FOR_FREE_USER
                                + " Freunden erreicht. Upgrade auf Pro, um mehr Freunde hinzuzufügen.");
            }
        }

        User sender = friendship.getUserOne();
        if (!sender.isPro()) {
            long friendCountSender = friendshipRepository.countAcceptedFriendsForUser(sender);
            if (friendCountSender >= MAX_FRIENDS_FOR_FREE_USER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Der anfragende Benutzer hat sein Freundeslimit (" + MAX_FRIENDS_FOR_FREE_USER
                                + ") erreicht und kann nicht als Freund hinzugefügt werden.");
            }
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        friendshipRepository.save(friendship);
        logger.info("Benutzer {} hat die Freundschaftsanfrage ID {} von Benutzer {} angenommen", currentUsername,
                requestId, friendship.getUserOne().getUsername());
    }

    @Transactional
    public void rejectFriendRequest(String currentUsername, Long requestId) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + currentUsername));

        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new FriendRequestNotFoundException(
                        "Freundschaftsanfrage mit ID " + requestId + " nicht gefunden."));

        boolean isReceiver = friendship.getUserTwo().getId().equals(currentUser.getId());
        boolean isSender = friendship.getUserOne().getId().equals(currentUser.getId());

        if ((!isReceiver && !isSender) || friendship.getStatus() != FriendshipStatus.PENDING) {
            logger.warn(
                    "Versuch, eine ungültige oder nicht zu Benutzer {} gehörende Anfrage ID {} abzulehnen/zurückzuziehen",
                    currentUsername, requestId);
            throw new InvalidFriendRequestOperationException("Die Anfrage kann nicht abgelehnt/zurückgezogen werden.");
        }

        friendshipRepository.delete(friendship);
        if (isReceiver) {
            logger.info("Benutzer {} hat die Freundschaftsanfrage ID {} von Benutzer {} abgelehnt", currentUsername,
                    requestId, friendship.getUserOne().getUsername());
        } else {
            logger.info("Benutzer {} hat seine Freundschaftsanfrage ID {} an Benutzer {} zurückgezogen",
                    currentUsername, requestId, friendship.getUserTwo().getUsername());
        }
    }

    public static class FriendNotFoundException extends RuntimeException {
        public FriendNotFoundException(String message) {
            super(message);
        }
    }

    public static class FriendRequestNotFoundException extends RuntimeException {
        public FriendRequestNotFoundException(String message) {
            super(message);
        }
    }

    public static class InvalidFriendRequestOperationException extends RuntimeException {
        public InvalidFriendRequestOperationException(String message) {
            super(message);
        }
    }
}