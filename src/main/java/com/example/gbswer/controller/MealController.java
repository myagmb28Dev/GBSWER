package com.example.gbswer.controller;

import com.example.gbswer.dto.ApiResponseDto;
import com.example.gbswer.service.MealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'TEACHER')")
    public ResponseEntity<?> getMonthlyMeals(@RequestParam int year, @RequestParam int month) {
        var result = mealService.getMonthlyMeals(year, month);
        // 빈 결과도 정상적인 응답으로 처리 (해당 월에 급식 데이터가 없을 수 있음)
        return ResponseEntity.ok(ApiResponseDto.success(result != null ? result : Collections.emptyList()));
    }

    @PostMapping("/refresh")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'TEACHER')")
    public ResponseEntity<?> refreshMonthlyMeals(@RequestParam int year, @RequestParam int month) {
        var result = mealService.refreshMonthlyMeals(year, month);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

}
