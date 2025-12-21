package com.example.gbswer.controller;

import com.example.gbswer.dto.*;
import com.example.gbswer.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto req) {
        var result = authService.login(req);
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshDto req) {
        var result = authService.refreshAccessToken(req.getRefreshToken());
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }
}
