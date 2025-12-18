package com.example.gbswer.repository;

import com.example.gbswer.entity.Schedule;
import com.example.gbswer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByUser(User user);
    List<Schedule> findByUserAndDueDate(User user, LocalDate dueDate);
    List<Schedule> findByUserAndDueDateBetween(User user, LocalDate start, LocalDate end);
}

