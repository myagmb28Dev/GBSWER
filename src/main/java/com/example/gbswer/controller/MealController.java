package com.example.gbswer.controller;

import com.example.gbswer.dto.ApiResponseDto;
import com.example.gbswer.service.MealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @GetMapping
    public ResponseEntity<?> getMonthlyMeals(@RequestParam int year, @RequestParam int month) {
        var result = mealService.getMonthlyMeals(year, month);
        if (result == null || result.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponseDto.error("DB에 급식 데이터가 없습니다."));
        }
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @PostMapping("/refresh")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> refreshMonthlyMeals(@RequestParam int year, @RequestParam int month) {
        var result = mealService.refreshMonthlyMeals(year, month);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

}
