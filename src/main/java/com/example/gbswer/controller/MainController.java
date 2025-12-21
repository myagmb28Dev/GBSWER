package com.example.gbswer.controller;

import com.example.gbswer.dto.ApiResponseDto;
import com.example.gbswer.dto.UserDto;
import com.example.gbswer.service.MainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/main")
@RequiredArgsConstructor
public class MainController {

    private final MainService mainService;

    @GetMapping("/")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserDto userDto) {
        var result = mainService.getDashboard(userDto.getId());
        return ResponseEntity.ok(ApiResponseDto.success(result));
    }
}
