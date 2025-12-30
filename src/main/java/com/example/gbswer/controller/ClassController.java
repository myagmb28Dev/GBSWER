package com.example.gbswer.controller;

import com.example.gbswer.dto.*;
import com.example.gbswer.service.ClassService;
import com.example.gbswer.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;
    private final TaskService taskService;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<?> createClass(@AuthenticationPrincipal UserDto userDto,
                                         @RequestBody ClassCreateDto request) {
        try {
            ClassDto result = classService.createClass(userDto, request);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode())
                    .body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("클래스 생성에 실패했습니다."));
        }
    }

    @PostMapping("/join")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> joinClass(@AuthenticationPrincipal UserDto userDto,
                                       @RequestBody ClassJoinDto request) {
        try {
            ClassJoinDto result = classService.joinClass(userDto, request);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode())
                    .body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("클래스 참여에 실패했습니다."));
        }
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<?> getClassesForTeacher(@AuthenticationPrincipal UserDto userDto) {
        try {
            List<ClassDto> result = classService.getClassesForTeacher(userDto);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("클래스 목록 조회에 실패했습니다."));
        }
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllClassesForAdmin() {
        try {
            List<ClassDto> result = classService.getAllClassesForAdmin();
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("관리자 클래스 목록 조회에 실패했습니다."));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT')")
    public ResponseEntity<?> getClassesForUser(@AuthenticationPrincipal UserDto userDto) {
        try {
            List<ClassDto> result;
            if ("TEACHER".equalsIgnoreCase(userDto.getRole())) {
                result = classService.getClassesForTeacher(userDto);
            } else {
                result = classService.getClassesForStudent(userDto);
            }
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("클래스 목록 조회에 실패했습니다."));
        }
    }

    @GetMapping("/{classId}")
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT')")
    public ResponseEntity<?> getClassById(@PathVariable Long classId,
                                          @AuthenticationPrincipal UserDto userDto) {
        try {
            ClassDto result = classService.getClassById(classId, userDto);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode())
                    .body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("클래스 조회에 실패했습니다."));
        }
    }

    @DeleteMapping("/{classId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<?> deleteClass(@PathVariable Long classId,
                                         @AuthenticationPrincipal UserDto userDto) {
        try {
            classService.deleteClass(classId, userDto);
            return ResponseEntity.ok(ApiResponseDto.success(null));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode())
                    .body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("클래스 삭제에 실패했습니다."));
        }
    }

    @GetMapping("/{classId}/participants")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<?> getParticipants(@PathVariable Long classId,
                                             @AuthenticationPrincipal UserDto userDto) {
        try {
            List<ClassParticipantDto> result = classService.getParticipants(classId, userDto);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode())
                    .body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("참가자 목록 조회에 실패했습니다."));
        }
    }

    @DeleteMapping("/{classId}/participants/{studentId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<?> removeParticipant(@PathVariable Long classId,
                                               @PathVariable Long studentId,
                                               @AuthenticationPrincipal UserDto userDto) {
        try {
            classService.removeParticipant(classId, studentId, userDto);
            return ResponseEntity.ok(ApiResponseDto.success(null));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode())
                    .body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("참가자 퇴장에 실패했습니다."));
        }
    }

    @GetMapping("/{classId}/posts")
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT')")
    public ResponseEntity<?> getPosts(@PathVariable Long classId,
                                      @RequestParam(defaultValue = "1") int page,
                                      @RequestParam(defaultValue = "20") int limit,
                                      @RequestParam(required = false) String type,
                                      @AuthenticationPrincipal UserDto userDto) {
        try {
            // 클래스에 속한 posts만 필터링하여 반환
            List<TaskDto> allTasks = taskService.getAllTasks();
            List<TaskDto> filteredTasks = allTasks.stream()
                    .filter(t -> t.getClassId() != null && t.getClassId().equals(classId))
                    .filter(t -> type == null || type.equals(t.getType()))
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(ApiResponseDto.success(filteredTasks));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("게시물 목록 조회에 실패했습니다."));
        }
    }

    @PostMapping(path = "/{classId}/posts", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_OCTET_STREAM_VALUE})
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<?> createPost(@PathVariable Long classId,
                                        @AuthenticationPrincipal UserDto userDto,
                                        @RequestPart("dto") TaskCreateDto dto,
                                        @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content is required");
        }
        try {
            TaskDto result = taskService.createTask(userDto.getId(), dto.getTitle(), dto.getContent(), dto.getType(), classId, dto.getDueDate(), files);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode())
                    .body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("게시물 생성에 실패했습니다."));
        }
    }

    // 과제 제출 관련 API
    @PostMapping(path = "/{classId}/posts/{postId}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitAssignment(@PathVariable Long classId,
                                              @PathVariable Long postId,
                                              @AuthenticationPrincipal UserDto userDto,
                                              @RequestPart(required = false) List<MultipartFile> files) {
        try {
            SubmissionDto result = taskService.submitTask(postId, userDto.getId(), files);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode())
                    .body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("과제 제출에 실패했습니다."));
        }
    }

    @PutMapping(path = "/{classId}/posts/{postId}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> updateSubmission(@PathVariable Long classId,
                                              @PathVariable Long postId,
                                              @AuthenticationPrincipal UserDto userDto,
                                              @RequestPart(required = false) List<MultipartFile> files) {
        try {
            SubmissionDto result = taskService.submitTask(postId, userDto.getId(), files);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode())
                    .body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("제출 수정에 실패했습니다."));
        }
    }

    @GetMapping("/{classId}/posts/{postId}/submissions")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<?> getSubmissions(@PathVariable Long classId,
                                            @PathVariable Long postId,
                                            @AuthenticationPrincipal UserDto userDto) {
        try {
            List<SubmissionDto> result = taskService.getSubmissionsByTask(postId);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("제출 현황 조회에 실패했습니다."));
        }
    }

    // 제출 평가 API 추가
    @PostMapping("/{classId}/posts/{postId}/submissions/{submissionId}/review")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<?> reviewSubmission(@PathVariable Long classId,
                                              @PathVariable Long postId,
                                              @PathVariable Long submissionId,
                                              @AuthenticationPrincipal UserDto userDto,
                                              @RequestBody SubmissionReviewDto request) {
        try {
            SubmissionDto result = taskService.reviewSubmission(submissionId, request.getFeedback(), com.example.gbswer.entity.Submission.SubmissionStatus.valueOf(request.getStatus()));
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode())
                    .body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("제출 평가에 실패했습니다."));
        }
    }

    @GetMapping("/{classId}/posts/{postId}/my-submission")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMySubmission(@PathVariable Long classId,
                                             @PathVariable Long postId,
                                             @AuthenticationPrincipal UserDto userDto) {
        try {
            List<SubmissionDto> submissions = taskService.getMySubmissions(userDto.getId());
            SubmissionDto result = submissions.stream()
                    .filter(s -> s.getTaskId().equals(postId))
                    .findFirst()
                    .orElse(null);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("제출물 조회에 실패했습니다."));
        }
    }

    @PutMapping(path = "/{classId}/posts/{postId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_OCTET_STREAM_VALUE})
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<?> updatePost(@PathVariable Long classId,
                                        @PathVariable Long postId,
                                        @AuthenticationPrincipal UserDto userDto,
                                        @RequestPart("dto") TaskCreateDto dto,
                                        @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        try {
            TaskDto result = taskService.updateTask(postId, userDto.getId(), dto.getTitle(), dto.getContent(), dto.getType(), classId, dto.getDueDate(), files);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode())
                    .body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("게시물 수정에 실패했습니다."));
        }
    }

    @DeleteMapping("/{classId}/posts/{postId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<?> deletePost(@PathVariable Long classId,
                                        @PathVariable Long postId,
                                        @AuthenticationPrincipal UserDto userDto) {
        try {
            taskService.deleteTask(postId, userDto.getId());
            return ResponseEntity.ok(ApiResponseDto.success(null));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode())
                    .body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("게시물 삭제에 실패했습니다."));
        }
    }

    @GetMapping("/notices/today")
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT','ADMIN')")
    public ResponseEntity<?> getTodayNotices() {
        try {
            List<TaskDto> allTasks = taskService.getAllTasks();
            List<TaskDto> notices = allTasks.stream()
                    .filter(t -> "공지".equals(t.getType()))
                    .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().toLocalDate().equals(java.time.LocalDate.now()))
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(ApiResponseDto.success(notices));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("공지사항 조회에 실패했습니다."));
        }
    }

    @GetMapping("/notices/created-this-week")
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT','ADMIN')")
    public ResponseEntity<?> getThisWeekNotices() {
        try {
            java.time.LocalDate now = java.time.LocalDate.now();
            java.time.LocalDate startOfWeek = now.minusDays(now.getDayOfWeek().getValue() - 1);
            List<TaskDto> allTasks = taskService.getAllTasks();
            List<TaskDto> notices = allTasks.stream()
                    .filter(t -> "공지".equals(t.getType()))
                    .filter(t -> t.getCreatedAt() != null && !t.getCreatedAt().toLocalDate().isBefore(startOfWeek))
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(ApiResponseDto.success(notices));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("공지사항 조회에 실패했습니다."));
        }
    }
}
