package com.example.gbswer.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import com.example.gbswer.dto.UserDto;
import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class TokenService {

    private final Key signingKey;
    private final long expirationMillis;
    private final String rawSecret;

    public TokenService(@Value("${jwt.secret:}") String secret,
                        @Value("${jwt.expiration-ms:43200000}") long expirationMillis) throws Exception {
        this.rawSecret = secret == null ? "" : secret;
        this.expirationMillis = expirationMillis;
        // signingKey will be initialized in @PostConstruct after validating secret
        this.signingKey = null;
    }

    @PostConstruct
    private void init() throws Exception {
        if (rawSecret == null || rawSecret.isBlank()) {
            throw new IllegalStateException("JWT secret is not configured. Set jwt.secret in application properties or environment.");
        }
        // Ensure we have a 256-bit key for HMAC-SHA256 by deriving SHA-256 of the provided secret
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] keyBytes = md.digest(rawSecret.getBytes(StandardCharsets.UTF_8));
        // use Keys.hmacShaKeyFor with the derived key
        java.lang.reflect.Field keyField = TokenService.class.getDeclaredField("signingKey");
        keyField.setAccessible(true);
        keyField.set(this, Keys.hmacShaKeyFor(keyBytes));
    }

    public String createToken(Long userId, String name, String role) {
        return createTokenWithExpiration(userId, name, role, expirationMillis);
    }

    public String createTokenWithExpiration(Long userId, String name, String roles, long customExpirationMillis) {
        Instant now = Instant.now();
        Date issuedAt = Date.from(now);
        Date exp = Date.from(now.plusMillis(customExpirationMillis));
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("name", name)
                .claim("roles", roles)
                .setIssuedAt(issuedAt)
                .setExpiration(exp)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSigningKey() {
        try {
            java.lang.reflect.Field keyField = TokenService.class.getDeclaredField("signingKey");
            keyField.setAccessible(true);
            return (Key) keyField.get(this);
        } catch (Exception e) {
            throw new IllegalStateException("Signing key not initialized", e);
        }
    }

    public Optional<UserDto> parseToken(String token) {
        try {
            Jws<Claims> jws = Jwts.parser().verifyWith((SecretKey) getSigningKey()).build().parseSignedClaims(token);
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
                    .department(null)
                    .build();
            return Optional.of(dto);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public void revoke(String token) {
        // Stateless JWT: revoke requires additional store (blacklist) — not implemented here
    }
}
