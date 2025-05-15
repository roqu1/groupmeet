package com.groupmeet.application.controller;

import com.groupmeet.application.dto.UserSearchQueryCriteria;
import com.groupmeet.application.dto.UserSearchResultDto;
import com.groupmeet.application.model.Gender;
import com.groupmeet.application.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/search")
    public ResponseEntity<Page<UserSearchResultDto>> searchUsers(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) List<String> genders,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) List<String> interests,
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 5) Pageable pageable) {

        UserSearchQueryCriteria criteria = new UserSearchQueryCriteria();
        criteria.setSearchTerm(searchTerm);
        if (genders != null && !genders.isEmpty()) {
            try {
                criteria.setGenders(genders.stream()
                                          .map(s -> Gender.valueOf(s.toUpperCase()))
                                          .collect(Collectors.toList()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build(); 
            }
        }
        criteria.setLocation(location);
        criteria.setInterests(interests);

        Page<UserSearchResultDto> results = userService.searchUsers(criteria, userDetails.getUsername(), pageable);
        return ResponseEntity.ok(results);
    }
}