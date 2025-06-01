package com.groupmeet.application.service;

import com.groupmeet.application.dto.CurrentUserMeetingMembership;
import com.groupmeet.application.dto.MeetingCreationDto;
import com.groupmeet.application.dto.MeetingDetailDto;
import com.groupmeet.application.dto.MeetingDto;
import com.groupmeet.application.dto.MeetingParticipantDetailsDto;
import com.groupmeet.application.dto.MeetingParticipantPreviewDto;
import com.groupmeet.application.dto.MeetingParticipantsPageDto;
import com.groupmeet.application.dto.MeetingSearchCriteriaDto;
import com.groupmeet.application.model.*;
import com.groupmeet.application.repository.BlockedMeetingParticipantRepository;
import com.groupmeet.application.repository.InterestRepository;
import com.groupmeet.application.repository.MeetingRepository;
import com.groupmeet.application.repository.UserRepository;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.groupmeet.application.dto.UserProfileMeetingDto;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import org.springframework.data.domain.PageImpl;
import java.util.Comparator;
import java.util.stream.Stream;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private static final Logger logger = LoggerFactory.getLogger(MeetingService.class);

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InterestRepository interestRepository;

    @Autowired
    private BlockedMeetingParticipantRepository blockedMeetingParticipantRepository;

    private static final int PARTICIPANTS_PREVIEW_SIZE = 5;

    @Transactional
    public MeetingDto createMeeting(MeetingCreationDto dto, String creatorUsername) {
        User creator = userRepository.findByUsername(creatorUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + creatorUsername));

        logger.info("Received meetingTypeNames for creation: {}", dto.getMeetingTypeNames());

        if (dto.getMeetingTypeNames() == null || dto.getMeetingTypeNames().isEmpty()) {
            throw new IllegalArgumentException("Mindestens eine Meeting-Art ist erforderlich.");
        }

        List<String> nonNullInterestNames = dto.getMeetingTypeNames().stream()
            .filter(Objects::nonNull) 
            .collect(Collectors.toList());
        
        List<String> validInterestNames = nonNullInterestNames.stream()
            .map(String::trim)
            .filter(name -> !name.isEmpty())
            .collect(Collectors.toList());

        if (validInterestNames.isEmpty()) {
            throw new IllegalArgumentException("Mindestens eine gültige Meeting-Art ist erforderlich. Die bereitgestellte Liste war leer oder enthielt nur leere Zeichenfolgen.");
        }
        
        logger.info("Validated and trimmed meetingTypeNames for creation: {}", validInterestNames);


        Set<Interest> meetingInterests = new HashSet<>();
        for (String interestName : validInterestNames) {
            Interest interest = interestRepository.findByNameIgnoreCase(interestName)
                    .orElseGet(() -> {
                        logger.info("Creating new interest: {}", interestName);
                        return interestRepository.save(new Interest(interestName));
                    });
            meetingInterests.add(interest);
        }
        
        if (meetingInterests.isEmpty()) {
             throw new IllegalArgumentException("Gültige Meeting-Arten konnten nicht gefunden oder erstellt werden.");
        }

        if (dto.getFormat() == MeetingFormat.OFFLINE && !StringUtils.hasText(dto.getLocation())) {
            throw new IllegalArgumentException("Ort ist für Offline-Meetings erforderlich.");
        }

        Meeting meeting = new Meeting();
        meeting.setTitle(dto.getTitle());
        meeting.setDescription(dto.getDescription());
        meeting.setFormat(dto.getFormat());
        meeting.setMeetingTypes(meetingInterests);
        meeting.setLocation(dto.getLocation());
        meeting.setDateTime(dto.getDateTime());
        meeting.setMaxParticipants(dto.getMaxParticipants());
        meeting.setCreator(creator);

        meeting.addParticipant(creator);

        Meeting savedMeeting = meetingRepository.save(meeting);
        logger.info("Meeting '{}' (ID: {}) created by {}", savedMeeting.getTitle(), savedMeeting.getId(), creatorUsername);
        return MeetingDto.fromEntity(savedMeeting);
    }

    @Transactional(readOnly = true)
    public Page<MeetingDto> searchMeetings(MeetingSearchCriteriaDto criteria, Pageable pageable) {
        Specification<Meeting> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(criteria.getSearchTerm())) {
                String searchTermLower = "%" + criteria.getSearchTerm().toLowerCase() + "%";

                Expression<String> titlePath = root.get("title");
                Predicate titleMatch = criteriaBuilder.like(criteriaBuilder.lower(titlePath), searchTermLower);

                Expression<String> descriptionPath = root.get("description");
                Predicate descriptionMatch = criteriaBuilder.like(criteriaBuilder.lower(descriptionPath), searchTermLower);

                predicates.add(criteriaBuilder.or(titleMatch, descriptionMatch));
            }

            if (criteria.getTypes() != null && !criteria.getTypes().isEmpty()) {
                Join<Meeting, Interest> meetingTypeJoin = root.joinSet("meetingTypes", JoinType.LEFT);
                predicates.add(meetingTypeJoin.get("name").in(criteria.getTypes()));
                query.distinct(true);
            }

            if (StringUtils.hasText(criteria.getLocation())) {
                if (criteria.getFormat() == null || criteria.getFormat() == MeetingFormat.OFFLINE) {
                    predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("location")), criteria.getLocation().toLowerCase()));
                }
            }

            if (criteria.getFormat() != null) {
                predicates.add(criteriaBuilder.equal(root.get("format"), criteria.getFormat()));
            }

            if (criteria.getStartDate() != null) {
                LocalDateTime startDateTime = criteria.getStartDate().atTime(LocalTime.MIN);
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("dateTime"), startDateTime));
            }

            if (criteria.getEndDate() != null) {
                LocalDateTime endDateTime = criteria.getEndDate().atTime(LocalTime.MAX);
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("dateTime"), endDateTime));
            }

            predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("dateTime"), LocalDateTime.now().minusHours(2)));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Meeting> meetingsPage = meetingRepository.findAll(spec, pageable);
        return meetingsPage.map(MeetingDto::fromEntity);
    }

    @Transactional
    public void joinMeeting(Long meetingId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + username));
        Meeting meeting = meetingRepository.findById(meetingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting nicht gefunden"));

        if (blockedMeetingParticipantRepository.existsByMeetingAndUser(meeting, user)) {
            logger.warn("User {} is blocked from meeting {} and cannot join.", username, meetingId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sie sind für dieses Meeting gesperrt.");
        }

        if (meeting.getParticipants().contains(user)) {
            logger.info("User {} is already a participant in meeting {}.", username, meetingId);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sie sind bereits Teilnehmer dieses Meetings.");
        }

        if (meeting.getMaxParticipants() != null && meeting.getParticipants().size() >= meeting.getMaxParticipants()) {
            logger.warn("Meeting {} is full. User {} cannot join.", meetingId, username);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Das Meeting hat bereits die maximale Teilnehmerzahl erreicht.");
        }
        
        if (meeting.getDateTime().isBefore(LocalDateTime.now())) {
            logger.warn("User {} attempted to join past meeting {}.", username, meetingId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dieses Meeting hat bereits stattgefunden.");
        }

        meeting.addParticipant(user);
        meetingRepository.save(meeting);
        logger.info("User {} successfully joined meeting {}.", username, meetingId);
    }

    @Transactional
    public void leaveMeeting(Long meetingId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + username));
        Meeting meeting = meetingRepository.findById(meetingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting nicht gefunden"));

        if (meeting.getCreator().equals(user)) {
            if (meeting.getParticipants().size() > 1) {
                 logger.warn("Organizer {} attempted to leave meeting {} while other participants are present.", username, meetingId);
                 throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Der Organisator kann das Meeting nicht verlassen, solange andere Teilnehmer vorhanden sind. Das Meeting muss ggf. gelöscht werden.");
            }
        }
        
        if (meeting.getDateTime().isBefore(LocalDateTime.now())) {
            logger.warn("User {} attempted to leave past meeting {}.", username, meetingId);
        }

        boolean removed = meeting.getParticipants().remove(user);
        if (removed) {
            meetingRepository.save(meeting);
            logger.info("User {} successfully left meeting {}.", username, meetingId);
        } else {
            logger.warn("User {} was not a participant in meeting {}. Cannot leave.", username, meetingId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sie sind kein Teilnehmer dieses Meetings.");
        }
    }

    @Transactional
    public void blockParticipant(Long meetingId, Long userIdToBlock, String organizerUsername) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting nicht gefunden"));

        User organizer = userRepository.findByUsername(organizerUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Organisator nicht gefunden: " + organizerUsername));

        if (!meeting.getCreator().getId().equals(organizer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nur der Organisator kann Teilnehmer blockieren.");
        }

        User userToBlock = userRepository.findById(userIdToBlock)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zu blockierender Benutzer nicht gefunden"));

        if (userToBlock.getId().equals(organizer.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organisator kann sich nicht selbst blockieren.");
        }

        if (blockedMeetingParticipantRepository.existsByMeetingAndUser(meeting, userToBlock)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Benutzer ist bereits für dieses Meeting blockiert.");
        }

        boolean removed = meeting.getParticipants().removeIf(participant -> participant.getId().equals(userIdToBlock));
        if (removed) {
             logger.info("User {} (ID: {}) removed from active participants of meeting {} by organizer {}.", userToBlock.getUsername(), userIdToBlock, meetingId, organizerUsername);
        } else {
            logger.info("User {} (ID: {}) was not an active participant in meeting {} when block was initiated by {}.", userToBlock.getUsername(), userIdToBlock, meetingId, organizerUsername);
        }
        if(removed) meetingRepository.save(meeting);


        BlockedMeetingParticipant blockedEntry = new BlockedMeetingParticipant(meeting, userToBlock, organizer);
        blockedMeetingParticipantRepository.save(blockedEntry);
        logger.info("User {} (ID: {}) successfully blocked from meeting {} by organizer {}.", userToBlock.getUsername(), userIdToBlock, meetingId, organizerUsername);
    }

    @Transactional
    public void unblockParticipant(Long meetingId, Long userIdToUnblock, String organizerUsername) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting nicht gefunden"));

        User organizer = userRepository.findByUsername(organizerUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Organisator nicht gefunden: " + organizerUsername));

        if (!meeting.getCreator().getId().equals(organizer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nur der Organisator kann die Blockierung aufheben.");
        }

        User userToUnblock = userRepository.findById(userIdToUnblock)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zu entblockender Benutzer nicht gefunden"));

        BlockedMeetingParticipant blockedEntry = blockedMeetingParticipantRepository.findByMeetingAndUser(meeting, userToUnblock)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Benutzer ist nicht für dieses Meeting blockiert."));

        blockedMeetingParticipantRepository.delete(blockedEntry);
        logger.info("User {} (ID: {}) successfully unblocked from meeting {} by organizer {}.", userToUnblock.getUsername(), userIdToUnblock, meetingId, organizerUsername);
    }

    @Transactional
    public void removeParticipantFromMeeting(Long meetingId, Long userIdToRemove, String organizerUsername) {
        Meeting meeting = meetingRepository.findById(meetingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting nicht gefunden"));

        User organizer = userRepository.findByUsername(organizerUsername)
            .orElseThrow(() -> new UsernameNotFoundException("Organisator nicht gefunden: " + organizerUsername));

        if (!meeting.getCreator().getId().equals(organizer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nur der Organisator kann Teilnehmer entfernen.");
        }

        User userToRemove = userRepository.findById(userIdToRemove)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zu entfernender Benutzer nicht gefunden"));
        
        if (userToRemove.getId().equals(meeting.getCreator().getId())) {
             throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Der Organisator kann nicht aus dem Meeting entfernt werden. Das Meeting muss ggf. gelöscht werden.");
        }

        if (blockedMeetingParticipantRepository.existsByMeetingAndUser(meeting, userToRemove)) {
             throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dieser Benutzer ist für das Meeting blockiert und kann nicht auf diese Weise entfernt werden. Heben Sie zuerst die Blockierung auf.");
        }

        boolean removed = meeting.getParticipants().removeIf(participant -> participant.getId().equals(userIdToRemove));
        if (removed) {
            meetingRepository.save(meeting);
            logger.info("User {} (ID: {}) removed from meeting {} by organizer {}.", userToRemove.getUsername(), userIdToRemove, meetingId, organizerUsername);
        } else {
            logger.warn("User {} (ID: {}) was not an active participant in meeting {} when removal was initiated by {}.", userToRemove.getUsername(), userIdToRemove, meetingId, organizerUsername);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Benutzer ist kein Teilnehmer dieses Meetings.");
        }
    }


    @Transactional(readOnly = true)
    public MeetingParticipantsPageDto getMeetingParticipantsDetails(
            Long meetingId, String viewerUsername, Pageable pageable, String searchTerm) {

        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting nicht gefunden"));

        User viewer = userRepository.findByUsername(viewerUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Betrachter nicht gefunden: " + viewerUsername));

        boolean isViewerOrganizer = meeting.getCreator().getId().equals(viewer.getId());

        List<MeetingParticipantDetailsDto> allParticipantDetails = new ArrayList<>();

        meeting.getParticipants().forEach(user -> {
            allParticipantDetails.add(MeetingParticipantDetailsDto.fromUser(
                    user,
                    user.getId().equals(meeting.getCreator().getId()),
                    "ACTIVE"
            ));
        });

        if (isViewerOrganizer) {
            List<BlockedMeetingParticipant> blockedEntries = blockedMeetingParticipantRepository.findByMeeting(meeting);
            blockedEntries.forEach(blockedEntry -> {
                boolean alreadyListed = allParticipantDetails.stream()
                    .anyMatch(p -> p.getId().equals(blockedEntry.getUser().getId()));

                if (alreadyListed) {
                    allParticipantDetails.stream()
                        .filter(p -> p.getId().equals(blockedEntry.getUser().getId()))
                        .findFirst()
                        .ifPresent(pDto -> pDto.setParticipationStatus("BLOCKED"));
                } else {
                    allParticipantDetails.add(MeetingParticipantDetailsDto.fromUser(
                            blockedEntry.getUser(),
                            false,
                            "BLOCKED"
                    ));
                }
            });
        }
        

        Stream<MeetingParticipantDetailsDto> filteredStream = allParticipantDetails.stream();
        if (StringUtils.hasText(searchTerm)) {
            String lowerSearchTerm = searchTerm.toLowerCase();
            filteredStream = filteredStream.filter(p ->
                p.getUsername().toLowerCase().contains(lowerSearchTerm) ||
                p.getFirstName().toLowerCase().contains(lowerSearchTerm) ||
                p.getLastName().toLowerCase().contains(lowerSearchTerm)
            );
        }
        
        List<MeetingParticipantDetailsDto> filteredParticipants = filteredStream
            .sorted(Comparator.comparing(MeetingParticipantDetailsDto::isOrganizer).reversed()
                                .thenComparing(dto -> "BLOCKED".equals(dto.getParticipationStatus()))
                                .thenComparing(MeetingParticipantDetailsDto::getFirstName)
                                .thenComparing(MeetingParticipantDetailsDto::getLastName))
            .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredParticipants.size());
        
        List<MeetingParticipantDetailsDto> pageContent = List.of();
        if (start < end) {
             pageContent = filteredParticipants.subList(start, end);
        }
       

        Page<MeetingParticipantDetailsDto> participantsPage = new PageImpl<>(pageContent, pageable, filteredParticipants.size());
        return new MeetingParticipantsPageDto(participantsPage, isViewerOrganizer, meeting.getTitle());
    }

    @Transactional(readOnly = true)
    public Page<UserProfileMeetingDto> getUserParticipatedMeetings(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Benutzer nicht gefunden"));

        Page<Meeting> meetingsPage = meetingRepository.findMeetingsByParticipantOrderByDateTimeAsc(user, pageable);

        LocalDateTime now = LocalDateTime.now();

        return meetingsPage.map(meeting -> {
            String status;
            LocalDateTime meetingEndTime = meeting.getDateTime().plusHours(2); 

            if (meeting.getDateTime().isAfter(now)) {
                status = "UPCOMING";
            } else if (meetingEndTime.isBefore(now)) {
                status = "COMPLETED";
            } else {
                status = "ONGOING";
            }
            return UserProfileMeetingDto.fromEntity(meeting, status);
        });
    }

    @Transactional(readOnly = true)
    public MeetingDetailDto getMeetingDetailsById(Long meetingId, String currentUsername) {
        Meeting meeting = meetingRepository.findById(meetingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting nicht gefunden"));

        final User currentUser = (currentUsername != null && !currentUsername.isBlank()) 
            ? userRepository.findByUsername(currentUsername).orElse(null) 
            : null;

        MeetingDetailDto dto = new MeetingDetailDto();
        dto.setId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setDescription(meeting.getDescription());
        dto.setDateTime(meeting.getDateTime());
        dto.setLocation(meeting.getLocation());
        dto.setFormat(meeting.getFormat());
        dto.setMeetingTypeNames(
            meeting.getMeetingTypes().stream()
                .map(Interest::getName)
                .collect(Collectors.toList())
        );
        dto.setMaxParticipants(meeting.getMaxParticipants());

        User organizerEntity = meeting.getCreator();
        dto.setOrganizer(new MeetingParticipantPreviewDto(
            organizerEntity.getId(),
            organizerEntity.getFirstName(),
            organizerEntity.getLastName(),
            organizerEntity.getAvatarUrl(),
            true
        ));

        List<BlockedMeetingParticipant> blockedForThisMeeting = blockedMeetingParticipantRepository.findByMeeting(meeting);
        Set<Long> blockedUserIds = blockedForThisMeeting.stream()
                                        .map(bmp -> bmp.getUser().getId())
                                        .collect(Collectors.toSet());

        List<MeetingParticipantPreviewDto> preview = meeting.getParticipants().stream()
            .filter(p -> !p.getId().equals(organizerEntity.getId()))
            .filter(p -> !blockedUserIds.contains(p.getId()))
            .limit(PARTICIPANTS_PREVIEW_SIZE -1)
            .map(p -> new MeetingParticipantPreviewDto(
                p.getId(),
                p.getFirstName(),
                p.getLastName(),
                p.getAvatarUrl(),
                false
            ))
            .collect(Collectors.toList());
        dto.setParticipantsPreview(preview);

        long activeParticipantCount = meeting.getParticipants().stream()
                                            .filter(p -> !blockedUserIds.contains(p.getId()))
                                            .count();
        dto.setTotalParticipants((int) activeParticipantCount);
        dto.setParticipantCount((int) activeParticipantCount);


        if (currentUser != null) {
            dto.setCurrentUserOrganizer(currentUser.getId().equals(organizerEntity.getId()));
            boolean isActiveMember = meeting.getParticipants().stream().anyMatch(p -> p.getId().equals(currentUser.getId())) 
                                && !blockedUserIds.contains(currentUser.getId());
            dto.setCurrentUserMembership(isActiveMember ? CurrentUserMeetingMembership.MEMBER : CurrentUserMeetingMembership.NOT_MEMBER);
        } else {
            dto.setCurrentUserOrganizer(false);
            dto.setCurrentUserMembership(CurrentUserMeetingMembership.NOT_MEMBER);
        }

        logger.info("Details für Meeting ID {} abgerufen. Aktueller Benutzer: {}. Ist Organisator: {}. Mitgliedschaftsstatus: {}",
            meetingId, currentUsername, dto.isCurrentUserOrganizer(), dto.getCurrentUserMembership());

        return dto;
    }

    @Transactional
    public void deleteMeeting(Long meetingId, String organizerUsername) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting nicht gefunden"));

        User organizer = userRepository.findByUsername(organizerUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Organisator nicht gefunden: " + organizerUsername));

        if (!meeting.getCreator().getId().equals(organizer.getId())) {
            logger.warn("User {} (ID: {}) attempted to delete meeting {} (ID: {}) but is not the organizer.",
                    organizer.getUsername(), organizer.getId(), meeting.getTitle(), meeting.getId());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nur der Organisator kann das Meeting löschen.");
        }

        List<BlockedMeetingParticipant> blockedEntries = blockedMeetingParticipantRepository.findByMeeting(meeting);
        if (!blockedEntries.isEmpty()) {
            blockedMeetingParticipantRepository.deleteAllInBatch(blockedEntries); // Use deleteAllInBatch for efficiency
            logger.info("Deleted {} blocked participant entries for meeting ID {}.", blockedEntries.size(), meetingId);
        }

        meetingRepository.delete(meeting);
        logger.info("Meeting '{}' (ID: {}) successfully deleted by organizer {}.",
                meeting.getTitle(), meeting.getId(), organizerUsername);
    }
}
