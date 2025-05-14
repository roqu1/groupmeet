package com.groupmeet.application.controller;

import com.groupmeet.application.model.Interest;
import com.groupmeet.application.repository.InterestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class InterestController {

    @Autowired
    private InterestRepository interestRepository;

    public static class OptionDto {
        private String value;
        private String label;

        public OptionDto(String value, String label) {
            this.value = value;
            this.label = label;
        }
        public String getValue() { return value; }
        public String getLabel() { return label; }
    }

    @GetMapping("/interests")
    public ResponseEntity<List<OptionDto>> getAvailableInterests() {
        List<Interest> interests = interestRepository.findAll();
    List<OptionDto> interestOptions = interests.stream()
                .sorted((i1, i2) -> i1.getName().compareToIgnoreCase(i2.getName()))
                .map(interest -> new OptionDto(interest.getName(), interest.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(interestOptions);
    }
}