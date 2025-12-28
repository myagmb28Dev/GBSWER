package com.example.gbswer.repository;

import com.example.gbswer.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    @Query("SELECT DISTINCT e FROM CalendarEvent e LEFT JOIN FETCH e.user u " +
           "WHERE (e.startDate <= :end AND e.endDate >= :start) " +
           "AND (e.category = '학교' OR e.category = '개인')")
    List<CalendarEvent> findByStartDateBetweenAndUserId(@Param("start") LocalDate start, @Param("end") LocalDate end, @Param("userId") Long userId);

    @Query("SELECT DISTINCT e FROM CalendarEvent e LEFT JOIN FETCH e.user WHERE e.startDate <= :end AND e.endDate >= :start AND e.category = '학교'")
    List<CalendarEvent> findByStartDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    Optional<CalendarEvent> findByCategoryAndTitleAndStartDate(String category, String title, LocalDate startDate);
}
