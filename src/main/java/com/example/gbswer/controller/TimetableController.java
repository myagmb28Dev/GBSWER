package com.example.gbswer.controller;

import com.example.gbswer.dto.ApiResponseDto;
import com.example.gbswer.dto.UserDto;
import com.example.gbswer.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {
    private final TimetableService timetableService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'TEACHER')")
    public ResponseEntity<?> getFromDb(
            @RequestParam String date,
            @RequestParam(required = false) String major,
            @RequestParam(required = false) String grade,
            @RequestParam(name = "class", required = false) String classNm,
            @AuthenticationPrincipal UserDto userDto) {
        try {
            String queryDate = (date != null && !date.isEmpty()) ? date : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

            // 선생님인 경우 자신의 grade와 classNumber 사용
            if (userDto != null && "TEACHER".equalsIgnoreCase(userDto.getRole())) {
                if (grade == null && userDto.getGrade() != null) grade = userDto.getGrade().toString();
                if (classNm == null && userDto.getClassNumber() != null) classNm = userDto.getClassNumber().toString();
                if (major == null) major = userDto.getMajor();
            }

            var result = timetableService.getWeeklyFromDb(queryDate, major, grade, classNm);
            if (result == null || result.isEmpty() || result.stream().allMatch(dto -> dto.getPeriods().isEmpty())) {
                return ResponseEntity.status(404).body(ApiResponseDto.error("DB에 시간표 데이터가 없습니다."));
            }
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponseDto.error("시간표 DB 조회 오류: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh-week")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'TEACHER')")
    public ResponseEntity<?> refreshWeek(
            @RequestParam String date,
            @RequestParam(required = false) String major,
            @RequestParam(required = false) String grade,
            @RequestParam(name = "class", required = false) String classNm,
            @AuthenticationPrincipal UserDto userDto) {
        try {
            // 선생님인 경우 자신의 grade와 classNumber 사용
            if (userDto != null && "TEACHER".equalsIgnoreCase(userDto.getRole())) {
                if (grade == null && userDto.getGrade() != null) grade = userDto.getGrade().toString();
                if (classNm == null && userDto.getClassNumber() != null) classNm = userDto.getClassNumber().toString();
                if (major == null) major = userDto.getMajor();
            }

            if (date == null || date.isEmpty() || major == null || major.isEmpty() || grade == null || grade.isEmpty() || classNm == null || classNm.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponseDto.error("required parameter missing: date/major/grade/class"));
            }

            var result = timetableService.refreshWeeklyByDate(date, major, grade, classNm);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponseDto.error("시간표 리프레시 오류: " + e.getMessage()));
        }
    }
}
