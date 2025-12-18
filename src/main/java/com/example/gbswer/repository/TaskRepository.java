package com.example.gbswer.repository;

import com.example.gbswer.entity.Task;
import com.example.gbswer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByTeacher(User teacher);
    List<Task> findByDueDateAfter(LocalDate date);
    List<Task> findByDueDateBetween(LocalDate start, LocalDate end);
}

