package com.example.gbswer.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 업로드된 파일을 /uploads/** 경로로 접근 가능하게 설정
        String uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize().toString();
        
        // file:// 접두사 제거하고 경로만 사용 (Docker 볼륨 마운트와 호환)
        if (!uploadPath.endsWith("/")) {
            uploadPath += "/";
        }
        
        // file: 접두사 추가 (슬래시 3개가 아닌 2개)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath);
    }
}
