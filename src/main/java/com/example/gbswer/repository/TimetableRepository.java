package com.example.gbswer.repository;

import com.example.gbswer.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByDateAndDepartmentAndGradeAndClassNumber(LocalDate date, String department, int grade, int classNumber);
    List<Timetable> findByDateBetweenAndDepartmentAndGradeAndClassNumber(LocalDate start, LocalDate end, String department, int grade, int classNumber);
}

