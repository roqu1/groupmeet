package com.groupmeet.application.service;

import com.groupmeet.application.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Locale;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {

        String lowerCaseUsernameOrEmail = usernameOrEmail.toLowerCase(Locale.ROOT);

        // Check if the username is an email or a username and return the user accordingly
        com.groupmeet.application.model.User user = userRepository.findByEmail(lowerCaseUsernameOrEmail)
            .or(() -> userRepository.findByUsername(lowerCaseUsernameOrEmail))
            .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden mit Benutzername oder E-Mail: " + lowerCaseUsernameOrEmail));

        return new User(user.getUsername(), user.getPassword(), new ArrayList<>());
    }
}