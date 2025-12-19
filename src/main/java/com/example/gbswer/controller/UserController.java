package com.example.gbswer.controller;

import com.example.gbswer.dto.*;
import com.example.gbswer.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDto userDto) {
        return ResponseEntity.ok(ApiResponseDto.success(userService.getProfile(userDto.getId())));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDto userDto, @RequestBody ProfileUpdateDto request) {
        return ResponseEntity.ok(ApiResponseDto.success(userService.updateProfile(userDto.getId(), request)));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDto userDto, @RequestBody PasswordChangeDto request) {
        userService.changePassword(userDto.getId(), request);
        return ResponseEntity.ok(ApiResponseDto.success(null));
    }

    @PostMapping("/email/send-code")
    public ResponseEntity<?> sendEmailVerificationCode(@AuthenticationPrincipal UserDto userDto, @RequestBody VerifyCodeSendDto request) {
        userService.sendEmailVerificationCode(userDto.getId(), request.getEmail());
        return ResponseEntity.ok(ApiResponseDto.success(null));
    }

    @PostMapping("/email/verify")
    public ResponseEntity<?> verifyAndSetEmail(@AuthenticationPrincipal UserDto userDto, @RequestBody EmailVerifyDto request) {
        return ResponseEntity.ok(ApiResponseDto.success(userService.verifyAndSetEmail(userDto.getId(), request.getEmail(), request.getCode())));
    }

    @PostMapping("/password/reset/send-code")
    public ResponseEntity<?> sendPasswordResetCode(@RequestBody VerifyCodeSendDto request) {
        userService.sendPasswordResetCode(request.getEmail());
        return ResponseEntity.ok(ApiResponseDto.success(null));
    }

    @PostMapping("/password/reset/verify")
    public ResponseEntity<?> verifyAndResetPassword(@RequestBody PasswordResetDto request) {
        userService.verifyAndResetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponseDto.success(null));
    }

    @DeleteMapping("/withdraw")
    public ResponseEntity<?> withdraw(@AuthenticationPrincipal UserDto userDto) {
        userService.withdraw(userDto.getId());
        return ResponseEntity.ok(ApiResponseDto.success(null));
    }

    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(ApiResponseDto.success(userService.getAllUsers()));
    }

    @PutMapping("/role/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody RoleUpdateDto request) {
        return ResponseEntity.ok(ApiResponseDto.success(userService.updateUserRole(userId, request.getRole())));
    }
}
