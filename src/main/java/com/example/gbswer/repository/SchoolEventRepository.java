package com.example.gbswer.repository;

import com.example.gbswer.entity.SchoolEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolEventRepository extends JpaRepository<SchoolEvent, Long> {

    List<SchoolEvent> findByEventDateBetweenOrderByEventDateAsc(LocalDate startDate, LocalDate endDate);

    Optional<SchoolEvent> findByEventDateAndEventName(LocalDate eventDate, String eventName);

    List<SchoolEvent> findByEventDate(LocalDate eventDate);
}

