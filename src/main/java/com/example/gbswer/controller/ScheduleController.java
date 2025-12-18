package com.example.gbswer.controller;

import com.example.gbswer.dto.ApiResponseDto;
import com.example.gbswer.dto.ScheduleCreateDto;
import com.example.gbswer.dto.UserDto;
import com.example.gbswer.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/")
    public ResponseEntity<?> getSchedulesByMonth(
            @AuthenticationPrincipal UserDto userDto,
            @RequestParam Integer year,
            @RequestParam Integer month) {
        return ResponseEntity.ok(ApiResponseDto.success(scheduleService.getSchedulesByMonth(userDto.getId(), year, month)));
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodaySchedules(@AuthenticationPrincipal UserDto userDto) {
        return ResponseEntity.ok(ApiResponseDto.success(scheduleService.getTodaySchedules(userDto.getId())));
    }

    @PostMapping("/add")
    public ResponseEntity<?> createSchedule(
            @AuthenticationPrincipal UserDto userDto,
            @RequestBody ScheduleCreateDto request) {
        return ResponseEntity.ok(ApiResponseDto.success(scheduleService.createSchedule(userDto.getId(), request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSchedule(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDto userDto,
            @RequestBody ScheduleCreateDto request) {
        return ResponseEntity.ok(ApiResponseDto.success(scheduleService.updateSchedule(id, userDto.getId(), request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDto userDto) {
        scheduleService.deleteSchedule(id, userDto.getId());
        return ResponseEntity.ok(ApiResponseDto.success(null));
    }
}

