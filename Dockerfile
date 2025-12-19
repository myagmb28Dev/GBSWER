 Multi-stage build for Spring Boot application
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:local}", "app.jar"]
# Run application

  CMD curl -f http://localhost:8080/actuator/health || exit 1
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
# Health check

EXPOSE 8080
# Expose port

USER spring
# Switch to non-root user

RUN mkdir -p uploads && chown -R spring:spring /app
# Create upload directory

COPY --from=builder /app/build/libs/*.jar app.jar
# Copy built jar from builder stage

RUN groupadd -r spring && useradd -r -g spring spring
# Create non-root user for security

WORKDIR /app

FROM openjdk:17-jdk-slim
# Stage 2: Runtime

RUN ./gradlew build -x test --no-daemon
RUN chmod +x ./gradlew
# Build application (skip tests for faster build)

COPY src src
# Copy source code

COPY gradle gradle
COPY build.gradle settings.gradle gradlew ./
# Copy Gradle files

WORKDIR /app

FROM gradle:8.5-jdk17 AS builder
# Stage 1: Build


