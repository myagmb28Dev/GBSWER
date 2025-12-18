package com.example.gbswer.service;

import com.example.gbswer.dto.PasswordChangeDto;
import com.example.gbswer.dto.ProfileUpdateDto;
import com.example.gbswer.dto.UserDto;
import com.example.gbswer.entity.User;
import com.example.gbswer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserDto getProfile(Long userId) {
        User user = findUserById(userId);
        return convertToDto(user);
    }

    @Transactional
    public UserDto updateProfile(Long userId, ProfileUpdateDto request) {
        User user = findUserById(userId);

        if (request.getName() != null) user.setName(request.getName());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getGrade() != null) user.setGrade(request.getGrade());
        if (request.getClassNumber() != null) user.setClassNumber(request.getClassNumber());
        if (request.getStudentNumber() != null) user.setStudentNumber(request.getStudentNumber());
        if (request.getEmail() != null) user.setEmail(request.getEmail());

        userRepository.save(user);
        return convertToDto(user);
    }

    @Transactional
    public void changePassword(Long userId, PasswordChangeDto request) {
        User user = findUserById(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void withdraw(Long userId) {
        User user = findUserById(userId);
        userRepository.delete(user);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUserRole(Long userId, String role) {
        User user = findUserById(userId);
        user.setRole(User.Role.valueOf(role));
        userRepository.save(user);
        return convertToDto(user);
    }

    public List<UserDto> getStudentList() {
        return userRepository.findByRole(User.Role.STUDENT).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void sendEmailVerificationCode(Long userId, String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            User existingUser = userRepository.findByEmail(email).get();
            if (!existingUser.getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다.");
            }
        }

        emailService.sendVerificationCode(email);
        log.info("Verification code sent to email: {} for user: {}", email, userId);
    }

    @Transactional
    public UserDto verifyAndSetEmail(Long userId, String email, String code) {
        if (!emailService.verifyEmailCode(email, code)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증 코드가 올바르지 않거나 만료되었습니다.");
        }

        User user = findUserById(userId);
        user.setEmail(email);
        userRepository.save(user);

        log.info("Email verified and set for user: {}", userId);
        return convertToDto(user);
    }

    public void sendPasswordResetCode(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "해당 이메일로 등록된 사용자가 없습니다."));

        emailService.sendPasswordResetCode(email);
        log.info("Password reset code sent to email: {}", email);
    }

    @Transactional
    public void verifyAndResetPassword(String email, String code, String newPassword) {
        if (!emailService.verifyPasswordResetCode(email, code)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증 코드가 올바르지 않거나 만료되었습니다.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password reset for user: {}", user.getId());
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
    }

    private UserDto convertToDto(User user) {
        String displayInfo = null;
        if (user.getDepartment() != null && user.getGrade() != null && user.getClassNumber() != null) {
            displayInfo = String.format("%s %d학년 %d반", user.getDepartment(), user.getGrade(), user.getClassNumber());
            if (user.getStudentNumber() != null) {
                displayInfo += String.format(" %d번", user.getStudentNumber());
            }
        }

        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .grade(user.getGrade())
                .classNumber(user.getClassNumber())
                .studentNumber(user.getStudentNumber())
                .role(user.getRole().name())
                .displayInfo(displayInfo)
                .build();
    }
}
