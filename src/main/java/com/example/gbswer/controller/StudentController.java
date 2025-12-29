package com.example.gbswer.controller;

import com.example.gbswer.dto.ApiResponseDto;
import com.example.gbswer.service.TaskService;
import com.example.gbswer.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
public class StudentController {

    private final UserService userService;
    private final TaskService taskService;

    @GetMapping("/list")
    public ResponseEntity<?> getStudentList() {
        var result = userService.getStudentList();
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @GetMapping("/{studentId}/tasks")
    public ResponseEntity<?> getStudentTasks(@PathVariable Long studentId) {
        var result = taskService.getMySubmissions(studentId);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @GetMapping("/{studentId}/profile")
    public ResponseEntity<?> getStudentProfile(@PathVariable Long studentId) {
        var result = userService.getProfile(studentId);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }
}
