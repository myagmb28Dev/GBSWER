package com.example.gbswer.controller;

import com.example.gbswer.dto.ApiResponseDto;
import com.example.gbswer.service.MealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @GetMapping
    public ResponseEntity<?> getMonthlyMeals(@RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(ApiResponseDto.success(mealService.getMonthlyMeals(year, month)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshMeals(@RequestParam int year, @RequestParam int month) {
        mealService.fetchAndSaveMealsFromNeis(year, month);
        return ResponseEntity.ok(ApiResponseDto.success(
                String.format("%d년 %d월 급식 데이터가 업데이트되었습니다.", year, month)));
    }
}

