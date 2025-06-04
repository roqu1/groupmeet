package com.groupmeet.application.controller;

import com.groupmeet.application.controller.AuthController.ErrorResponse;
import com.groupmeet.application.controller.AuthController.MessageResponse;
import com.groupmeet.application.dto.FriendDto;
import com.groupmeet.application.dto.FriendRequestDto;
import com.groupmeet.application.service.FriendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private FriendService friendService;

    @GetMapping
    public ResponseEntity<Page<FriendDto>> getFriends(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String searchTerm,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Page<FriendDto> friends = friendService.getFriends(userDetails.getUsername(), searchTerm, pageable);
        return ResponseEntity.ok(friends);
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long friendId) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            friendService.removeFriend(userDetails.getUsername(), friendId);
            return ResponseEntity.noContent().build();
        } catch (FriendService.FriendNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    @PostMapping("/requests/{targetUserId}")
    public ResponseEntity<?> sendFriendRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long targetUserId) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            friendService.sendFriendRequest(userDetails.getUsername(), targetUserId);
            return ResponseEntity.ok(new MessageResponse("Freundschaftsanfrage erfolgreich gesendet."));
        } catch (UsernameNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new ErrorResponse(e.getReason()));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Fehler beim Senden der Freundschaftsanfrage.", e);
        }
    }

    @GetMapping("/requests/incoming")
    public ResponseEntity<Page<FriendRequestDto>> getIncomingFriendRequests(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            Page<FriendRequestDto> requests = friendService.getIncomingFriendRequests(userDetails.getUsername(), pageable);
            return ResponseEntity.ok(requests);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/requests/{requestId}/accept")
    public ResponseEntity<?> acceptFriendRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long requestId) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            friendService.acceptFriendRequest(userDetails.getUsername(), requestId);
            return ResponseEntity.ok(new MessageResponse("Freundschaftsanfrage angenommen."));
        } catch (FriendService.FriendRequestNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (FriendService.InvalidFriendRequestOperationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new ErrorResponse(e.getReason()));
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Benutzerfehler."));
        }
    }

    @DeleteMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> rejectFriendRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long requestId) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            friendService.rejectFriendRequest(userDetails.getUsername(), requestId);
            return ResponseEntity.ok(new MessageResponse("Freundschaftsanfrage abgelehnt/zurückgezogen."));
        } catch (FriendService.FriendRequestNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (FriendService.InvalidFriendRequestOperationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Benutzerfehler."));
        }
    }
}