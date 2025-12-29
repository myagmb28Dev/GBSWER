package com.example.gbswer.repository;

import com.example.gbswer.entity.Class;
import com.example.gbswer.entity.ClassParticipant;
import com.example.gbswer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassParticipantRepository extends JpaRepository<ClassParticipant, Long> {
    List<ClassParticipant> findByClassEntity(Class classEntity);
    Optional<ClassParticipant> findByClassEntityAndStudent(Class classEntity, User student);
    boolean existsByClassEntityAndStudent(Class classEntity, User student);
    List<ClassParticipant> findByStudent(User student);
}
