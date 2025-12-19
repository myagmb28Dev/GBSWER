package com.example.gbswer.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "verification.code")
public class VerificationProperties {
    private int expirationMinutes = 5;
}

