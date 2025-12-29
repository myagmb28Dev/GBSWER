package com.example.gbswer.controller;

import com.example.gbswer.dto.ApiResponseDto;
import com.example.gbswer.dto.CalendarEventDto;
import com.example.gbswer.dto.UserDto;
import com.example.gbswer.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final CalendarService calendarService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT','ADMIN')")
    public ResponseEntity<?> getSchedulesByMonth(
            @AuthenticationPrincipal UserDto userDto,
            @RequestParam Integer year,
            @RequestParam Integer month) {
        var result = calendarService.getMonthly(userDto.getId(), year, month);
        if (result == null || result.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponseDto.error("DB에 일정 데이터가 없습니다."));
        }
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT','ADMIN')")
    public ResponseEntity<?> getTodaySchedules(@AuthenticationPrincipal UserDto userDto) {
        var result = calendarService.getToday(userDto.getId());
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT','ADMIN')")
    public ResponseEntity<?> createSchedule(
            @AuthenticationPrincipal UserDto userDto,
            @RequestBody CalendarEventDto request) {
        var result = calendarService.createPersonal(userDto.getId(), request);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT','ADMIN')")
    public ResponseEntity<?> updateSchedule(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDto userDto,
            @RequestBody CalendarEventDto request) {
        var result = calendarService.updateEvent(userDto.getId(), id, request);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT','ADMIN')")
    public ResponseEntity<?> deleteSchedule(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDto userDto) {
        calendarService.deleteEvent(userDto.getId(), id);
        return ResponseEntity.ok(ApiResponseDto.success(null));
    }


    @PostMapping("/refresh-month")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> refreshMonth(@RequestParam int year, @RequestParam int month) {
        var result = calendarService.refreshMonth(year, month);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }
}
