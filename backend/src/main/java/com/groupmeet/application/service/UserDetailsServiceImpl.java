package com.groupmeet.application.service;

import com.groupmeet.application.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Check if the username is an email or a username and return the user accordingly
        com.groupmeet.application.model.User user = userRepository.findByEmail(username)
            .or(() -> userRepository.findByUsername(username))
            .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden mit Benutzername oder E-Mail: " + username));

        return new User(user.getUsername(), user.getPassword(), new ArrayList<>());
    }
}