package com.example.gbswer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "meals", indexes = {
    @Index(name = "idx_meal_date", columnList = "meal_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meal_date", nullable = false)
    private LocalDate mealDate;

    @Column(name = "meal_type", nullable = false, length = 20)
    private String mealType; // BREAKFAST, LUNCH, DINNER

    @Column(name = "dishes", columnDefinition = "TEXT")
    private String dishes; // JSON array or newline-separated

    @Column(name = "calorie", length = 50)
    private String calorie;

    @Column(name = "origin_data", columnDefinition = "TEXT")
    private String originData; // 원본 NEIS 데이터 보관용
}

