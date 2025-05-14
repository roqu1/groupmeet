package com.groupmeet.application.repository;

import com.groupmeet.application.dto.UserSearchQueryCriteria;
import com.groupmeet.application.model.Interest;
import com.groupmeet.application.model.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Repository
public class UserRepositoryCustomImpl implements UserRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<User> root, UserSearchQueryCriteria criteria, Long currentUserId) {
        List<Predicate> predicates = new ArrayList<>();

        if (currentUserId != null) {
            predicates.add(cb.notEqual(root.get("id"), currentUserId));
        }

        if (StringUtils.hasText(criteria.getSearchTerm())) {
            String searchTermLower = "%" + criteria.getSearchTerm().toLowerCase() + "%";
            Predicate usernameMatch = cb.like(cb.lower(root.get("username")), searchTermLower);
            Predicate firstNameMatch = cb.like(cb.lower(root.get("firstName")), searchTermLower);
            Predicate lastNameMatch = cb.like(cb.lower(root.get("lastName")), searchTermLower);
            predicates.add(cb.or(usernameMatch, firstNameMatch, lastNameMatch));
        }

        if (criteria.getGenders() != null && !criteria.getGenders().isEmpty()) {
            predicates.add(root.get("gender").in(criteria.getGenders()));
        }

        if (StringUtils.hasText(criteria.getLocation())) {
            predicates.add(cb.equal(cb.lower(root.get("location")), criteria.getLocation().toLowerCase()));
        }

        if (criteria.getInterests() != null && !criteria.getInterests().isEmpty()) {
            SetJoin<User, Interest> interestJoin = root.joinSet("interests", JoinType.LEFT);
            List<Predicate> interestPredicates = new ArrayList<>();
            for (String interestName : criteria.getInterests()) {
                interestPredicates.add(cb.equal(cb.lower(interestJoin.get("name")), interestName.toLowerCase()));
            }
            predicates.add(cb.or(interestPredicates.toArray(new Predicate[0])));
        }
        return predicates;
    }

    @Override
    public Page<User> searchUsers(UserSearchQueryCriteria criteria, Long currentUserId, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<User> cq = cb.createQuery(User.class);
        Root<User> userRoot = cq.from(User.class);
        List<Predicate> mainQueryPredicates = buildPredicates(cb, userRoot, criteria, currentUserId);
        cq.where(mainQueryPredicates.toArray(new Predicate[0]));

        if (criteria.getInterests() != null && !criteria.getInterests().isEmpty()) {
            cq.distinct(true);
        }

        if (pageable.getSort().isSorted()) {
            List<Order> orders = new ArrayList<>();
            for (Sort.Order order : pageable.getSort()) {
                Path<?> propertyPath = userRoot.get(order.getProperty());
                if (order.isAscending()) {
                    orders.add(cb.asc(propertyPath));
                } else {
                    orders.add(cb.desc(propertyPath));
                }
            }
            cq.orderBy(orders);
        } else {
            cq.orderBy(cb.asc(userRoot.get("username")));
        }

        TypedQuery<User> query = entityManager.createQuery(cq);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());
        List<User> resultList = query.getResultList();

        CriteriaQuery<Long> countCq = cb.createQuery(Long.class);
        Root<User> countRoot = countCq.from(User.class);
        List<Predicate> countQueryPredicates = buildPredicates(cb, countRoot, criteria, currentUserId);
        countCq.where(countQueryPredicates.toArray(new Predicate[0]));

        if (criteria.getInterests() != null && !criteria.getInterests().isEmpty()) {
            countCq.select(cb.countDistinct(countRoot));
        } else {
            countCq.select(cb.count(countRoot));
        }

        Long total = entityManager.createQuery(countCq).getSingleResult();

        return new PageImpl<>(resultList, pageable, total);
    }
}