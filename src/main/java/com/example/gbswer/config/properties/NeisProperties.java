package com.example.gbswer.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "neis.api")
public class NeisProperties {
    private String key;
    private String atptCode;
    private String schoolCode;
    private String url;
    private String scheduleUrl;
    private String timetableUrl;
}

