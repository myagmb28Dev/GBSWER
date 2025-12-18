package com.example.gbswer.repository;

import com.example.gbswer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByName(String name);
    List<User> findByRole(User.Role role);
    Optional<User> findByEmail(String email);
}

