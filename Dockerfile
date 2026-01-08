# Build stage
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /workspace

# Gradle Wrapper 파일 복사 (의존성 캐싱을 위해 먼저 복사)
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY gradle.properties .

# gradle.properties에서 Windows 경로 제거 및 실행 권한 부여
RUN sed -i '/org.gradle.java.home/d' gradle.properties || true && \
    chmod +x gradlew && \
    sed -i 's/\r$//' gradlew

# 소스 코드 복사 (의존성과 분리하여 캐싱 최적화)
COPY src src

# Gradle Wrapper로 빌드 및 빌드 캐시 정리
RUN ./gradlew bootJar -x test --no-daemon && \
    rm -rf /root/.gradle/caches/* && \
    rm -rf /workspace/.gradle && \
    find /workspace -name "*.class" -delete

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 비root 사용자 생성 및 업로드 디렉토리 생성 (한 번에 처리)
RUN addgroup -S spring && \
    adduser -S spring -G spring && \
    mkdir -p uploads && \
    chown -R spring:spring /app

# 빌드된 JAR 파일 복사
COPY --from=builder /workspace/build/libs/*.jar app.jar

# 비root 사용자로 전환
USER spring

# 포트 노출
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
