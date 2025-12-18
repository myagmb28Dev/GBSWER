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

    @GetMapping
    public ResponseEntity<?> getTimetable(
            @RequestParam(required = false) String date,
            @RequestParam String department,
            @RequestParam String grade,
            @RequestParam(name = "class") String className,
            @RequestParam(required = false) String semester) {
        try {
            if (date != null && !date.isEmpty()) {
                return ResponseEntity.ok(ApiResponseDto.success(
                        timetableService.getDailyTimetable(date, department, grade, className, semester)));
            } else {
                return ResponseEntity.ok(ApiResponseDto.success(
                        timetableService.getWeeklyTimetable(null, null, department, grade, className, semester)));
            }
        } catch (Exception e) {
            log.error("시간표 조회 오류", e);
            return ResponseEntity.internalServerError().body(ApiResponseDto.error("시간표 조회 오류: " + e.getMessage()));
        }
    }

    @GetMapping("/daily")
    public ResponseEntity<?> getDailyTimetable(
            @RequestParam(required = false) String date,
            @RequestParam String department,
            @RequestParam String grade,
            @RequestParam(name = "class") String className,
            @RequestParam(required = false) String semester) {
        try {
            String queryDate = (date != null) ? date : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            return ResponseEntity.ok(ApiResponseDto.success(
                    timetableService.getDailyTimetable(queryDate, department, grade, className, semester)));
        } catch (Exception e) {
            log.error("시간표 조회 오류", e);
            return ResponseEntity.internalServerError().body(ApiResponseDto.error("시간표 조회 오류: " + e.getMessage()));
        }
    }

    @GetMapping("/weekly")
    public ResponseEntity<?> getWeeklyTimetable(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) Integer days,
            @RequestParam String department,
            @RequestParam String grade,
            @RequestParam(name = "class") String className,
            @RequestParam(required = false) String semester) {
        try {
            return ResponseEntity.ok(ApiResponseDto.success(
                    timetableService.getWeeklyTimetable(startDate, days, department, grade, className, semester)));
        } catch (Exception e) {
            log.error("시간표 조회 오류", e);
            return ResponseEntity.internalServerError().body(ApiResponseDto.error("시간표 조회 오류: " + e.getMessage()));
        }
    }
}
