package com.example.gbswer.controller;

import com.example.gbswer.dto.ApiResponseDto;
import com.example.gbswer.dto.UserDto;
import com.example.gbswer.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping("/")
    public ResponseEntity<?> getAllPosts(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size) {
        var result = communityService.getAllPosts(page, size);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @GetMapping("/major/{major}")
    public ResponseEntity<?> getPostsByMajor(@PathVariable String major,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "10") int size) {
        var result = communityService.getPostsByMajor(major, page, size);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @GetMapping("/major/{major}/only")
    public ResponseEntity<?> getPostsByMajorOnly(@PathVariable String major,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "10") int size) {
        var result = communityService.getPostsByMajorOnly(major, page, size);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @GetMapping("/my-major")
    public ResponseEntity<?> getPostsByMyMajor(@AuthenticationPrincipal UserDto userDto,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "10") int size) {
        var result = communityService.getPostsByMajor(userDto.getMajor(), page, size);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Long id) {
        var result = communityService.getPostById(id);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @PostMapping(path = "/write", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT')")
    public ResponseEntity<?> createPost(
            @AuthenticationPrincipal UserDto userDto,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(defaultValue = "ALL") String major,
            @RequestParam(required = false) List<MultipartFile> files,
            @RequestParam(defaultValue = "false") boolean anonymous) {
        Long authorId = (userDto != null) ? userDto.getId() : null;
        try {
            int fileCount = (files == null) ? 0 : files.size();

            var result = communityService.createPost(authorId, title, content, major, files, anonymous);

            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (Exception e) {
            // 예외를 그대로 상위로 전달하여 기존 글로벌 예외 핸들러가 처리하게 함
            throw e;
        }
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT')")
    public ResponseEntity<?> updatePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDto userDto,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) String major,
            @RequestParam(required = false) List<MultipartFile> files) {
        try {
            String finalMajor = major;
            // 학생은 자신의 major로만 변경 가능(요청값 무시)
            if (userDto.getRole() != null && userDto.getRole().equalsIgnoreCase("STUDENT")) {
                finalMajor = userDto.getMajor();
            }
            var result = communityService.updatePost(id, userDto.getId(), title, content, finalMajor, files);
            return ResponseEntity.ok(ApiResponseDto.success(result));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode()).body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("서버 오류가 발생했습니다. 관리자에게 문의하세요."));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT')")
    public ResponseEntity<?> deletePost(@PathVariable Long id, @AuthenticationPrincipal UserDto userDto) {
        try {
            communityService.deletePost(id, userDto.getId());
            return ResponseEntity.ok(ApiResponseDto.success(null));
        } catch (ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode()).body(ApiResponseDto.error(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("서버 오류가 발생했습니다. 관리자에게 문의하세요."));
        }
    }
}
