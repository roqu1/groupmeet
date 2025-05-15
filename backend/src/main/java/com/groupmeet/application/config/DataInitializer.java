// backend/src/main/java/com/groupmeet/application/config/DataInitializer.java
package com.groupmeet.application.config;

import com.groupmeet.application.model.Interest;
import com.groupmeet.application.repository.InterestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private InterestRepository interestRepository;

    public static final List<String> PREDEFINED_INTERESTS = Arrays.asList(
            "Sport", "Musik", "Reisen", "Kochen", "Filme", "Lesen",
            "Technologie", "Kunst", "Fotografie", "Gaming", "Wandern",
            "Tanzen", "Yoga", "Gartenarbeit", "Programmieren", "Wissenschaft",
            "Geschichte", "Theater", "Mode", "Autos", "Natur", "Politik",
            "Ehrenamt", "Tiere", "Handwerk");

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedInterests();
    }

    private void seedInterests() {
        long countBefore = interestRepository.count();
        long addedThisRun = 0;

        if (PREDEFINED_INTERESTS.isEmpty()) {
            logger.info("Predefined interest list is empty. No interests to seed. Current interest count in DB: {}",
                    countBefore);
            return;
        }

        for (String interestName : PREDEFINED_INTERESTS) {
            if (interestName == null || interestName.trim().isEmpty()) {
                logger.warn("Skipping null or empty interest name in PREDEFINED_INTERESTS.");
                continue;
            }
            if (interestRepository.findByNameIgnoreCase(interestName.trim()).isEmpty()) {
                interestRepository.save(new Interest(interestName.trim()));
                addedThisRun++;
                logger.debug("Saved new interest: {}", interestName.trim());
            }
        }

        long countAfter = interestRepository.count();

        if (addedThisRun > 0) {
            logger.info("Seeded {} new interests. Total interests in DB now: {}", addedThisRun, countAfter);
        } else {
            if (countBefore == 0 && !PREDEFINED_INTERESTS.stream().allMatch(s -> s == null || s.trim().isEmpty())) {
                logger.warn(
                        "Predefined interests list contains items, but no new interests were added and the table remains empty ({} total). This is unexpected. Please check predefined interest values and database behavior.",
                        countAfter);
            } else {
                logger.info(
                        "No new interests added from the predefined list ({} total predefined valid items). They likely already exist or the list was empty. Current total interests in DB: {}",
                        PREDEFINED_INTERESTS.stream().filter(s -> s != null && !s.trim().isEmpty()).count(),
                        countAfter);
            }
        }
    }
}
