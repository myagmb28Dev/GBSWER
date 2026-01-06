package com.example.gbswer.service;

import com.example.gbswer.dto.EmailVerifyDto;
import com.example.gbswer.dto.RoleUpdateDto;
import com.example.gbswer.dto.UserDto;
import com.example.gbswer.entity.User;
import com.example.gbswer.repository.UserRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
@Getter
@Setter
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final FileUploadService fileUploadService;

    public UserDto getProfile(Long userId) {
        User user = findUserById(userId);
        return convertToDto(user);
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
    }

    @Transactional
    public UserDto verifyAndSetEmail(Long userId, EmailVerifyDto request) {
        if (!emailService.verifyEmailCode(request.getEmail(), request.getCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증 코드가 올바르지 않거나 만료되었습니다.");
        }

        userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
            if (!existingUser.getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다.");
            }
        });

        User user = findUserById(userId);
        user.setEmail(request.getEmail());
        userRepository.save(user);

        return convertToDto(user);
    }

    public void sendPasswordResetCode(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "해당 이메일로 등록된 사용자가 없습니다."));

        emailService.sendPasswordResetCode(email);
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
    }

    @Transactional
    public void changePassword(long userId, String oldPassword, String newPassword) {
        User user = findUserById(userId);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "기존 비밀번호가 일치하지 않습니다.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public UserDto updateProfileImage(Long userId, MultipartFile profileImage) {
        User user = findUserById(userId);
        String oldImage = user.getProfileImage();
        if (oldImage != null) {
            fileUploadService.deleteFile(oldImage);
        }
        String imageUrl = fileUploadService.uploadCommunityImage(profileImage);
        user.setProfileImage(imageUrl);
        userRepository.save(user);
        log.info("User profile image updated (userId={}): [profileImage] '{}' -> '{}'", userId, oldImage, imageUrl);
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

    public boolean confirmPassword(Long userId, String password) {
        User user = findUserById(userId);
        if (user.getPassword() == null) return false;
        return passwordEncoder.matches(password, user.getPassword());
    }

    @Transactional
    public UserDto updateProfile(Long userId, UserDto request) {
        User user = findUserById(userId);
        boolean changed = false;
        StringBuilder changeLog = new StringBuilder();
        if (request.getName() != null && !request.getName().equals(user.getName())) {
            changeLog.append(String.format("[name] '%s' -> '%s'; ", user.getName(), request.getName()));
            user.setName(request.getName());
            changed = true;
        }
        if (request.getMajor() != null && !request.getMajor().equals(user.getMajor())) {
            changeLog.append(String.format("[major] '%s' -> '%s'; ", user.getMajor(), request.getMajor()));
            user.setMajor(request.getMajor());
            changed = true;
        }
        if (request.getGrade() != null && !request.getGrade().equals(user.getGrade())) {
            changeLog.append(String.format("[grade] '%s' -> '%s'; ", user.getGrade(), request.getGrade()));
            user.setGrade(request.getGrade());
            changed = true;
        }
        if (request.getClassNumber() != null && !request.getClassNumber().equals(user.getClassNumber())) {
            changeLog.append(String.format("[classNumber] '%s' -> '%s'; ", user.getClassNumber(), request.getClassNumber()));
            user.setClassNumber(request.getClassNumber());
            changed = true;
        }
        if (request.getBio() != null && !request.getBio().equals(user.getBio())) {
            changeLog.append(String.format("[bio] '%s' -> '%s'; ", user.getBio(), request.getBio()));
            user.setBio(request.getBio());
            changed = true;
        }
        if (request.getProfileImage() != null && !request.getProfileImage().equals(user.getProfileImage())) {
            changeLog.append(String.format("[profileImage] '%s' -> '%s'; ", user.getProfileImage(), request.getProfileImage()));
            user.setProfileImage(request.getProfileImage());
            changed = true;
        }
        if (request.getAdmissionYear() != null && !request.getAdmissionYear().equals(user.getAdmissionYear())) {
            changeLog.append(String.format("[admissionYear] '%s' -> '%s'; ", user.getAdmissionYear(), request.getAdmissionYear()));
            user.setAdmissionYear(request.getAdmissionYear());
            changed = true;
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            changeLog.append(String.format("[email] '%s' -> '%s'; ", user.getEmail(), request.getEmail()));
            user.setEmail(request.getEmail());
            changed = true;
        }
        if (changed) {
            log.info("User profile updated (userId={}): {}", userId, changeLog);
        }
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
                .admissionYear(user.getAdmissionYear())
                .build();
    }
}
