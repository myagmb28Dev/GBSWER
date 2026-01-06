# Stage 1: Build
FROM gradle:8.5-jdk21 AS builder

WORKDIR /app

# Copy Gradle files
COPY gradle gradle
COPY build.gradle settings.gradle gradlew ./
RUN chmod +x ./gradlew

# Copy source code
COPY src src

# Build application (skip tests for faster build)
RUN ./gradlew build -x test --no-daemon

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Create upload directory
RUN mkdir -p uploads && chown -R spring:spring /app

# Copy built jar from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Switch to non-root user
USER spring

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod}", "app.jar"]
