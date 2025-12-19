package com.example.gbswer.service;

import com.example.gbswer.config.properties.VerificationProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final StringRedisTemplate redisTemplate;
    private final VerificationProperties verificationProperties;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    private static final String VERIFICATION_CODE_PREFIX = "email:verification:";
    private static final String PASSWORD_RESET_PREFIX = "email:password-reset:";

    public void sendVerificationCode(String email) {
        String code = generateVerificationCode();
        redisTemplate.opsForValue().set(VERIFICATION_CODE_PREFIX + email, code, verificationProperties.getExpirationMinutes(), TimeUnit.MINUTES);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("[GBSWER] 이메일 인증 코드");
        message.setText(buildVerificationEmailContent(code));

        try {
            mailSender.send(message);
            log.info("Verification email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", email, e);
            throw new RuntimeException("이메일 발송에 실패했습니다.");
        }
    }

    public void sendPasswordResetCode(String email) {
        String code = generateVerificationCode();
        redisTemplate.opsForValue().set(PASSWORD_RESET_PREFIX + email, code, verificationProperties.getExpirationMinutes(), TimeUnit.MINUTES);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("[GBSWER] 비밀번호 재설정 인증 코드");
        message.setText(buildPasswordResetEmailContent(code));

        try {
            mailSender.send(message);
            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", email, e);
            throw new RuntimeException("이메일 발송에 실패했습니다.");
        }
    }

    public boolean verifyEmailCode(String email, String code) {
        String storedCode = redisTemplate.opsForValue().get(VERIFICATION_CODE_PREFIX + email);
        if (storedCode != null && storedCode.equals(code)) {
            redisTemplate.delete(VERIFICATION_CODE_PREFIX + email);
            return true;
        }
        return false;
    }

    public boolean verifyPasswordResetCode(String email, String code) {
        String storedCode = redisTemplate.opsForValue().get(PASSWORD_RESET_PREFIX + email);
        if (storedCode != null && storedCode.equals(code)) {
            redisTemplate.delete(PASSWORD_RESET_PREFIX + email);
            return true;
        }
        return false;
    }

    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    private String buildVerificationEmailContent(String code) {
        return String.format("""
            안녕하세요, GBSWER입니다.
            
            이메일 인증 코드: %s
            
            위 코드는 %d분 후에 만료됩니다.
            본인이 요청하지 않은 경우, 이 이메일을 무시해 주세요.
            
            감사합니다.
            GBSWER 팀
            """, code, verificationProperties.getExpirationMinutes());
    }

    private String buildPasswordResetEmailContent(String code) {
        return String.format("""
            안녕하세요, GBSWER입니다.
            
            비밀번호 재설정 인증 코드: %s
            
            위 코드는 %d분 후에 만료됩니다.
            본인이 요청하지 않은 경우, 이 이메일을 무시해 주세요.
            
            감사합니다.
            GBSWER 팀
            """, code, verificationProperties.getExpirationMinutes());
    }
}

