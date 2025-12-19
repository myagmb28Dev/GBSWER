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
        return ResponseEntity.ok(ApiResponseDto.success(communityService.getAllPosts()));
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<?> getPostsByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(ApiResponseDto.success(communityService.getPostsByDepartment(department)));
    }

    @GetMapping("/department/{department}/only")
    public ResponseEntity<?> getPostsByDepartmentOnly(@PathVariable String department) {
        return ResponseEntity.ok(ApiResponseDto.success(communityService.getPostsByDepartmentOnly(department)));
    }

    @GetMapping("/my-department")
    public ResponseEntity<?> getPostsByMyDepartment(@AuthenticationPrincipal UserDto userDto) {
        return ResponseEntity.ok(ApiResponseDto.success(communityService.getPostsByDepartment(userDto.getDepartment())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDto.success(communityService.getPostById(id)));
    }

    @PostMapping(value = "/write", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT')")
    public ResponseEntity<?> createPost(
            @AuthenticationPrincipal UserDto userDto,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(defaultValue = "ALL") String department,
            @RequestParam(required = false) List<MultipartFile> images) {
        return ResponseEntity.ok(ApiResponseDto.success(
                communityService.createPost(userDto.getId(), title, content, department, images)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT')")
    public ResponseEntity<?> updatePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDto userDto,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "existingImageUrls", required = false) List<String> existingImageUrls) {
        return ResponseEntity.ok(ApiResponseDto.success(
                communityService.updatePost(id, userDto.getId(), title, content, department, images, existingImageUrls)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT')")
    public ResponseEntity<?> deletePost(@PathVariable Long id, @AuthenticationPrincipal UserDto userDto) {
        communityService.deletePost(id, userDto.getId());
        return ResponseEntity.ok(ApiResponseDto.success(null));
    }
}
