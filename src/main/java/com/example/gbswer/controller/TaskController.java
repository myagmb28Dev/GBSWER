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

@RestController
@RequestMapping("/api/task")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/list")
    public ResponseEntity<?> getAllTasks() {
        return ResponseEntity.ok(ApiResponseDto.success(taskService.getAllTasks()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDto.success(taskService.getTaskById(id)));
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitTask(
            @AuthenticationPrincipal UserDto userDto,
            @RequestParam Long taskId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponseDto.success(taskService.submitTask(taskId, userDto.getId(), file)));
    }

    @GetMapping("/my-submissions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMySubmissions(@AuthenticationPrincipal UserDto userDto) {
        return ResponseEntity.ok(ApiResponseDto.success(taskService.getMySubmissions(userDto.getId())));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createTask(
            @AuthenticationPrincipal UserDto userDto,
            @RequestPart TaskCreateDto request,
            @RequestPart(required = false) MultipartFile file) {
        return ResponseEntity.ok(ApiResponseDto.success(taskService.createTask(userDto.getId(), request, file)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDto userDto,
            @RequestBody TaskCreateDto request) {
        return ResponseEntity.ok(ApiResponseDto.success(taskService.updateTask(id, userDto.getId(), request)));
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
        return ResponseEntity.ok(ApiResponseDto.success(taskService.getSubmissionsByTask(taskId)));
    }

    @GetMapping("/submission/{submissionId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getSubmissionById(@PathVariable Long submissionId) {
        return ResponseEntity.ok(ApiResponseDto.success(taskService.getSubmissionById(submissionId)));
    }

    @PostMapping("/submission/{submissionId}/review")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> reviewSubmission(
            @PathVariable Long submissionId,
            @RequestBody SubmissionReviewDto request) {
        return ResponseEntity.ok(ApiResponseDto.success(
                taskService.reviewSubmission(submissionId, request.getFeedback(), request.getStatus())));
    }
}

