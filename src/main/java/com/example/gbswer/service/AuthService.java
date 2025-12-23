package com.example.gbswer.service;

import java.util.Optional;

import com.example.gbswer.config.properties.JwtProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.gbswer.entity.User;
import com.example.gbswer.repository.UserRepository;
import com.example.gbswer.security.TokenService;
import com.example.gbswer.dto.LoginRequestDto;
import com.example.gbswer.dto.AuthResponseDto;
import com.example.gbswer.dto.UserDto;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final JwtProperties jwtProperties;

    @Transactional
    public AuthResponseDto login(LoginRequestDto request) {

        // 1. userId로 사용자 조회
        Optional<User> opt = userRepository.findByUserId(request.getUserId());
        if (opt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
        }

        User user = opt.get();

        // 2. 비밀번호 검증 및 초기 설정 로직
        if (user.getPassword() == null) {

            if (!"0000".equals(request.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
            }

            // "0000"을 BCrypt로 해시하여 저장
            String hashedPassword = passwordEncoder.encode("0000");
            user.setPassword(hashedPassword);
            userRepository.save(user);
        } else {
            // 이미 비밀번호가 설정된 경우: BCrypt로 검증

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
            }
        }

        try {
            // 3. JWT 토큰 생성
            String accessToken = tokenService.createToken(user.getId(), user.getName(), user.getRole().name());
            String refreshToken = tokenService.createTokenWithExpiration(user.getId(), user.getName(), user.getRole().name(), jwtProperties.getRefreshExpirationMs());


            // 4. 토큰 저장
            user.setAccessToken(accessToken);
            user.setRefreshToken(refreshToken);
            userRepository.save(user);


            return new AuthResponseDto(accessToken, refreshToken);

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error during login", e);
        }
    }

    @Transactional
    public AuthResponseDto refreshAccessToken(String refreshToken) {
        Optional<UserDto> userDtoOpt = tokenService.parseToken(refreshToken);
        if (userDtoOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid refresh token");
        }
        UserDto userDto = userDtoOpt.get();
        User user = userRepository.findById(userDto.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "user not found"));
        if (!refreshToken.equals(user.getRefreshToken())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "refresh token mismatch");
        }
        String newAccessToken = tokenService.createToken(user.getId(), user.getName(), user.getRole().name());
        user.setAccessToken(newAccessToken);
        userRepository.save(user);
        return new AuthResponseDto(newAccessToken, refreshToken);
    }
}
