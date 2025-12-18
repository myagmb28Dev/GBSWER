package com.example.gbswer.repository;

import com.example.gbswer.entity.Submission;
import com.example.gbswer.entity.Task;
import com.example.gbswer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByStudent(User student);
    List<Submission> findByTask(Task task);
    Optional<Submission> findByTaskAndStudent(Task task, User student);
}

