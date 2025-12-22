package com.example.gbswer.service;

import com.example.gbswer.dto.EmailVerifyDto;
import com.example.gbswer.dto.RoleUpdateDto;
import com.example.gbswer.dto.UserDto;
import com.example.gbswer.entity.User;
import com.example.gbswer.repository.UserRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Getter
@Setter
public class UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final FileUploadService fileUploadService;

    private static final String DEFAULT_PROFILE_IMAGE = "/static/images/default-profile.png";

    public UserDto getProfile(Long userId) {
        User user = findUserById(userId);
        return convertToDto(user);
    }

    @Transactional
    public void withdraw(Long userId) {
        User user = findUserById(userId);
        userRepository.delete(user);
        log.info("User withdrawn: {}", userId);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUserRole(Long userId, RoleUpdateDto request) {
        User user = findUserById(userId);
        user.setRole(User.Role.valueOf(request.getRole()));
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
    public UserDto verifyAndSetEmail(Long userId, EmailVerifyDto request) {
        if (!emailService.verifyEmailCode(request.getEmail(), request.getCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증 코드가 올바르지 않거나 만료되었습니다.");
        }

        User user = findUserById(userId);
        user.setEmail(request.getEmail());
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

    @Transactional
    public UserDto updateProfileImage(Long userId, MultipartFile profileImage) {
        User user = findUserById(userId);
        String imageUrl = fileUploadService.uploadCommunityImageLocal(profileImage);
        user.setProfileImage(imageUrl);
        userRepository.save(user);
        return convertToDto(user);
    }

    @Transactional
    public UserDto setDefaultProfileImage(Long userId) {
        User user = findUserById(userId);
        user.setProfileImage(null);
        userRepository.save(user);
        return convertToDto(user);
    }

    @Transactional
    public void logout(Long userId) {
        User user = findUserById(userId);
        user.setAccessToken(null);
        user.setRefreshToken(null);
        userRepository.save(user);
    }

    public UserDto updateProfile(Long userId, UserDto request) {
        User user = findUserById(userId);
        if (request.getName() != null) user.setName(request.getName());
        if (request.getMajor() != null) user.setMajor(request.getMajor());
        if (request.getGrade() != null) user.setGrade(request.getGrade());
        if (request.getClassNumber() != null) user.setClassNumber(request.getClassNumber());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        userRepository.save(user);
        return convertToDto(user);
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
    }

    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .major(user.getMajor())
                .grade(user.getGrade())
                .classNumber(user.getClassNumber())
                .studentNumber(user.getStudentNumber())
                .role(user.getRole().name())
                .userId(user.getUserId())
                .profileImage(user.getProfileImage())
                .bio(user.getBio())
                .build();
    }
}
