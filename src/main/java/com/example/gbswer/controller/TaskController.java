package com.example.gbswer.controller;

import com.example.gbswer.dto.ApiResponseDto;
import com.example.gbswer.dto.TaskCreateDto;
import com.example.gbswer.dto.SubmissionReviewDto;
import com.example.gbswer.dto.UserDto;
import com.example.gbswer.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/task")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/list")
    public ResponseEntity<?> getAllTasks() {
        var result = taskService.getAllTasks();
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable Long id) {
        var result = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitTask(
            @AuthenticationPrincipal UserDto userDto,
            @RequestParam Long taskId,
            @RequestParam List<MultipartFile> files) {
        var result = taskService.submitTask(taskId, userDto.getId(), files);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @GetMapping("/my-submissions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMySubmissions(@AuthenticationPrincipal UserDto userDto) {
        var result = taskService.getMySubmissions(userDto.getId());
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createTask(
            @AuthenticationPrincipal UserDto userDto,
            @RequestPart TaskCreateDto request,
            @RequestPart(required = false) List<MultipartFile> files) {
        var result = taskService.createTask(userDto.getId(), request, files);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDto userDto,
            @RequestPart TaskCreateDto request) {
        var result = taskService.updateTask(id, userDto.getId(), request);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDto userDto) {
        taskService.deleteTask(id, userDto.getId());
        return ResponseEntity.ok(ApiResponseDto.success(null));
    }

    @GetMapping("/submissions/{taskId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getSubmissionsByTask(@PathVariable Long taskId) {
        var result = taskService.getSubmissionsByTask(taskId);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @GetMapping("/submission/{submissionId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getSubmissionById(@PathVariable Long submissionId) {
        var result = taskService.getSubmissionById(submissionId);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @PostMapping("/submission/{submissionId}/review")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> reviewSubmission(
            @PathVariable Long submissionId,
            @RequestBody SubmissionReviewDto request) {
        var result = taskService.reviewSubmission(submissionId, request.getFeedback(), request.getStatus());
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }
}
