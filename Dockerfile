# Multi-stage build with Java 17
FROM gradle:8.5-jdk17 AS builder

WORKDIR /app

COPY gradle gradle
COPY gradle.properties settings.gradle gradlew gradlew.bat ./
RUN chmod +x ./gradlew

COPY build.gradle ./

COPY src src

RUN ./gradlew build -x test --no-daemon

# Runtime stage with Java 17 JRE
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
RUN mkdir -p uploads && chown -R spring:spring /app

COPY --from=builder /app/build/libs/*.jar app.jar

USER spring

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod}", "app.jar"]
