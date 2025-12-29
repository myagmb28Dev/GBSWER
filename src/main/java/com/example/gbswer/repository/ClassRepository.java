package com.example.gbswer.repository;

import com.example.gbswer.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<Class, Long> {
    Optional<Class> findByClassCode(String classCode);
    boolean existsByClassCode(String classCode);
}
