package com.groupmeet.application.repository;

import com.groupmeet.application.dto.UserSearchQueryCriteria;
import com.groupmeet.application.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserRepositoryCustom {
    Page<User> searchUsers(UserSearchQueryCriteria criteria, Long currentUserId, Pageable pageable);
}