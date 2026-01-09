package com.example.gbswer.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import com.example.gbswer.config.properties.JwtProperties;
import com.example.gbswer.dto.UserDto;
import jakarta.annotation.PostConstruct;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
@RequiredArgsConstructor
@SuppressWarnings("deprecation")
public class TokenService {

    private final JwtProperties jwtProperties;
    private Key signingKey;

    @PostConstruct
    private void init() throws Exception {
        String secret = jwtProperties.getSecret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT secret is not configured. Set jwt.secret in application properties or environment.");
        }
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] keyBytes = md.digest(secret.getBytes(StandardCharsets.UTF_8));
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String createToken(Long userId, String name, String role) {
        return createTokenWithExpiration(userId, name, role, jwtProperties.getExpirationMs());
    }

    public String createTokenWithExpiration(Long userId, String name, String roles, long customExpirationMillis) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("name", name)
                .claim("role", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(customExpirationMillis)))
                .signWith(signingKey)
                .compact();
    }

    public Optional<UserDto> parseToken(String token) {
        try {
            Jws<Claims> jws = Jwts.parser().verifyWith((SecretKey) signingKey).build().parseSignedClaims(token);
            Claims c = jws.getBody();
            Long userId = null;
            String sub = c.getSubject();
            if (sub != null) {
                try { userId = Long.valueOf(sub); } catch (NumberFormatException ignored) {}
            }
            String name = c.get("name", String.class);
            String role = c.get("role", String.class);
            UserDto dto = UserDto.builder()
                    .id(userId)
                    .name(name)
                    .role(role)
                    .email(null)
                    .major(null)
                    .build();
            return Optional.of(dto);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public void revoke(String token) {
    }
}
