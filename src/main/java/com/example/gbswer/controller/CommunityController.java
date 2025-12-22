package com.example.gbswer.controller;

import com.example.gbswer.dto.ApiResponseDto;
import com.example.gbswer.dto.UserDto;
import com.example.gbswer.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping("/")
    public ResponseEntity<?> getAllPosts() {
        var result = communityService.getAllPosts();
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @GetMapping("/major/{major}")
    public ResponseEntity<?> getPostsByMajor(@PathVariable String major) {
        var result = communityService.getPostsByMajor(major);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @GetMapping("/major/{major}/only")
    public ResponseEntity<?> getPostsByMajorOnly(@PathVariable String major) {
        var result = communityService.getPostsByMajorOnly(major);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @GetMapping("/my-major")
    public ResponseEntity<?> getPostsByMyMajor(@AuthenticationPrincipal UserDto userDto) {
        var result = communityService.getPostsByMajor(userDto.getMajor());
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
            @RequestParam(required = false) List<MultipartFile> files) {
        var result = communityService.createPost(userDto.getId(), title, content, major, files);
        return ResponseEntity.ok(ApiResponseDto.success(result));
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
        var result = communityService.updatePost(id, userDto.getId(), title, content, major, files);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT')")
    public ResponseEntity<?> deletePost(@PathVariable Long id, @AuthenticationPrincipal UserDto userDto) {
        communityService.deletePost(id, userDto.getId());
        return ResponseEntity.ok(ApiResponseDto.success(null));
    }
}
