package com.example.gbswer.service;

import com.example.gbswer.config.properties.VerificationProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

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
        } catch (Exception e) {
            throw new RuntimeException("이메일 발송에 실패했습니다.");
        }
    }

    public void sendPasswordResetCode(String email) {
        String temp = generateTemporaryPassword();
        redisTemplate.opsForValue().set(PASSWORD_RESET_PREFIX + email, temp, verificationProperties.getExpirationMinutes(), TimeUnit.MINUTES);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("[GBSWER] 임시 비밀번호 안내");
        message.setText(buildPasswordResetEmailContent(temp));

        try {
            mailSender.send(message);
        } catch (Exception e) {
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

    public boolean verifyPasswordResetCode(String email, String tempPassword) {
        String stored = redisTemplate.opsForValue().get(PASSWORD_RESET_PREFIX + email);
        if (stored != null && stored.equals(tempPassword)) {
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

    private String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        int length = 10;
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
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

    private String buildPasswordResetEmailContent(String tempPassword) {
        return String.format("""
            안녕하세요, GBSWER입니다.
            
            임시 비밀번호: %s
            
            위 임시 비밀번호로 로그인한 뒤, 반드시 새로운 비밀번호로 변경해 주세요.
            임시 비밀번호는 %d분 후에 만료됩니다.
            
            본인이 요청하지 않은 경우, 즉시 비밀번호를 변경하시고 관리자에게 문의하세요.
            
            감사합니다.
            GBSWER 팀
            """, tempPassword, verificationProperties.getExpirationMinutes());
    }
}
