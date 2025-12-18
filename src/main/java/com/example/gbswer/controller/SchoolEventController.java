package com.example.gbswer.controller;

import com.example.gbswer.dto.ApiResponseDto;
import com.example.gbswer.service.SchoolEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/school-events")
@RequiredArgsConstructor
public class SchoolEventController {

    private final SchoolEventService schoolEventService;

    @GetMapping
    public ResponseEntity<?> getMonthlyEvents(@RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(ApiResponseDto.success(schoolEventService.getMonthlyEvents(year, month)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshEvents(@RequestParam int year, @RequestParam int month) {
        schoolEventService.fetchAndSaveEventsFromNeis(year, month);
        return ResponseEntity.ok(ApiResponseDto.success(
                String.format("%d년 %d월 학사일정 데이터가 업데이트되었습니다.", year, month)));
    }
}

