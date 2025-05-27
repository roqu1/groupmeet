package com.groupmeet.application.service;

import com.groupmeet.application.dto.MeetingCreationDto;
import com.groupmeet.application.dto.MeetingDto;
import com.groupmeet.application.dto.MeetingSearchCriteriaDto;
import com.groupmeet.application.model.*;
import com.groupmeet.application.repository.InterestRepository;
import com.groupmeet.application.repository.MeetingRepository;
import com.groupmeet.application.repository.UserRepository;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MeetingService {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InterestRepository interestRepository;

    @Transactional
    public MeetingDto createMeeting(MeetingCreationDto dto, String creatorUsername) {
        User creator = userRepository.findByUsername(creatorUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + creatorUsername));

        Interest meetingType = interestRepository.findByNameIgnoreCase(dto.getMeetingTypeName())
                .orElseThrow(() -> new IllegalArgumentException("Meeting-Art nicht gefunden: " + dto.getMeetingTypeName()));

        if (dto.getFormat() == MeetingFormat.OFFLINE && !StringUtils.hasText(dto.getLocation())) {
            throw new IllegalArgumentException("Ort ist für Offline-Meetings erforderlich.");
        }

        Meeting meeting = new Meeting();
        meeting.setTitle(dto.getTitle());
        meeting.setDescription(dto.getDescription());
        meeting.setFormat(dto.getFormat());
        meeting.setMeetingType(meetingType);
        meeting.setLocation(dto.getLocation());
        meeting.setDateTime(dto.getDateTime());
        meeting.setMaxParticipants(dto.getMaxParticipants());
        meeting.setCreator(creator);

        meeting.addParticipant(creator); 

        Meeting savedMeeting = meetingRepository.save(meeting);
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
                predicates.add(root.get("meetingType").get("name").in(criteria.getTypes()));
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
}