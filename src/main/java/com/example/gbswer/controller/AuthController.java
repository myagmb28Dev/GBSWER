package com.example.gbswer.controller;

import com.example.gbswer.dto.*;
import com.example.gbswer.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto req) {
        return ResponseEntity.ok(ApiResponseDto.success(authService.login(req)));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDto userDto) {
        return ResponseEntity.ok(ApiResponseDto.success(authService.getCurrentUser(userDto.getId())));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshDto req) {
        return ResponseEntity.ok(ApiResponseDto.success(authService.refreshAccessToken(req.getRefreshToken())));
    }
}
