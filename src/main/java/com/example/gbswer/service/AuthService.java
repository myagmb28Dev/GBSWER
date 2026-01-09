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

        Optional<User> opt = userRepository.findByUserId(request.getUserId());
        if (opt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
        }

        User user = opt.get();

        if (user.getPassword() == null) {

            if (!"0000".equals(request.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
            }

            String hashedPassword = passwordEncoder.encode("0000");
            user.setPassword(hashedPassword);
            userRepository.save(user);
        } else {

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
            }
        }

        try {
            String accessToken = tokenService.createToken(user.getId(), user.getName(), user.getRole().name());
            String refreshToken = tokenService.createTokenWithExpiration(user.getId(), user.getName(), user.getRole().name(), jwtProperties.getRefreshExpirationMs());

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
        return new AuthResponseDto(newAccessToken, refreshToken);
    }
}
