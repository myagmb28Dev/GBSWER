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
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final JwtProperties jwtProperties;

    @Transactional
    public AuthResponseDto login(LoginRequestDto request) {
        log.debug("Login attempt for user: {}", request.getName());

        // 1. name으로 사용자 조회
        Optional<User> opt = userRepository.findByName(request.getName());
        if (opt.isEmpty()) {
            log.warn("User not found: {}", request.getName());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
        }

        User user = opt.get();
        log.debug("User found: {}, role: {}, department: {}, password is null: {}",
                  user.getName(), user.getRole(), user.getDepartment(), user.getPassword() == null);

        // 2. 비밀번호 검증 및 초기 설정 로직
        if (user.getPassword() == null) {
            // 초기 상태: password가 NULL인 경우
            log.debug("Initial login attempt for user: {}", user.getName());

            if (!"0000".equals(request.getPassword())) {
                log.warn("Initial password mismatch for user: {} (expected: 0000)", request.getName());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
            }

            // "0000"을 BCrypt로 해시하여 저장
            String hashedPassword = passwordEncoder.encode("0000");
            user.setPassword(hashedPassword);
            userRepository.save(user);
            log.info("✅ Initial password set for user: {}", user.getName());

        } else {
            // 이미 비밀번호가 설정된 경우: BCrypt로 검증
            log.debug("Regular login attempt for user: {}", user.getName());

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.warn("Password mismatch for user: {}", request.getName());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
            }

            log.debug("Password verified for user: {}", user.getName());
        }

        try {
            // 3. JWT 토큰 생성
            String accessToken = tokenService.createToken(user.getId(), user.getName(), user.getRole().name());
            String refreshToken = tokenService.createTokenWithExpiration(user.getId(), user.getName(), user.getRole().name(), jwtProperties.getRefreshExpirationMs());

            log.debug("Tokens created successfully for user: {}", user.getName());

            // 4. 토큰 저장
            user.setAccessToken(accessToken);
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            log.info("✅ Login successful for user: {}", user.getName());
            return new AuthResponseDto(accessToken, refreshToken);

        } catch (Exception e) {
            log.error("❌ Error during token creation for user: {}", user.getName(), e);
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
