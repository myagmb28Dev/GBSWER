package com.example.gbswer.controller;

import com.example.gbswer.dto.ApiResponseDto;
import com.example.gbswer.service.TimetableService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Slf4j
@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {
    private final TimetableService timetableService;

    // 하루치 시간표 조회
    @GetMapping("/daily")
    public ResponseEntity<?> getDailyTimetable(
            @RequestParam(required = false) String date,
            @RequestParam String department,
            @RequestParam String grade,
            @RequestParam(name = "class") String classNm,
            @RequestParam(required = false) String semester) {
        try {
            String queryDate = (date != null) ? date : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            // 공식 반 변환 적용
            int classInt = Integer.parseInt(classNm);
            int officialClass = timetableService.getOfficialClass(department, classInt);
            var result = timetableService.getDailyTimetable(queryDate, department, grade, String.valueOf(officialClass), semester);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (Exception e) {
            log.error("시간표 조회 오류", e);
            return ResponseEntity.internalServerError().body(ApiResponseDto.error("시간표 조회 오류: " + e.getMessage()));
        }
    }

    // 주간 시간표 조회
    @GetMapping("/weekly")
    public ResponseEntity<?> getWeeklyTimetable(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) Integer days,
            @RequestParam String department,
            @RequestParam String grade,
            @RequestParam(name = "class") String classNm,
            @RequestParam(required = false) String semester) {
        try {
            int classInt = Integer.parseInt(classNm);
            int officialClass = timetableService.getOfficialClass(department, classInt);
            var result = timetableService.getWeeklyTimetable(startDate, days, department, grade, String.valueOf(officialClass), semester);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (Exception e) {
            log.error("시간표 조회 오류", e);
            return ResponseEntity.internalServerError().body(ApiResponseDto.error("시간표 조회 오류: " + e.getMessage()));
        }
    }
}
