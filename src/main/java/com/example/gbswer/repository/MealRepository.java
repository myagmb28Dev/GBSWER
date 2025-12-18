package com.example.gbswer.repository;

import com.example.gbswer.entity.Meal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MealRepository extends JpaRepository<Meal, Long> {

    @Query("SELECT m FROM Meal m WHERE m.mealDate BETWEEN :startDate AND :endDate " +
           "ORDER BY m.mealDate ASC, " +
           "CASE m.mealType " +
           "  WHEN 'BREAKFAST' THEN 1 " +
           "  WHEN 'LUNCH' THEN 2 " +
           "  WHEN 'DINNER' THEN 3 " +
           "  ELSE 4 " +
           "END")
    List<Meal> findByMealDateBetweenOrderByMealDateAscMealTypeAsc(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    Optional<Meal> findByMealDateAndMealType(LocalDate mealDate, String mealType);
    List<Meal> findByMealDate(LocalDate mealDate);
}

