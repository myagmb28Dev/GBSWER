# GBSWER Backend 🎓

경북소프트웨어마이스터고등학교 학생들을 위한 통합 서비스 백엔드

## 📋 주요 기능

- ✅ 인증 및 권한 관리 (JWT)
- ✅ 커뮤니티 (학과별 게시판, 이미지 업로드)
- ✅ 과제 제출 및 관리 (선생님/학생)
- ✅ 급식 정보 (NEIS API 연동)
- ✅ 학사일정 (NEIS API 연동)
- ✅ 시간표 (NEIS API 연동, 학과별 매핑)
- ✅ 개인 일정 관리
- ✅ 이메일 인증 (Redis)
- ✅ 파일 업로드 (AWS S3)

## 🛠️ 기술 스택

- **Framework**: Spring Boot 3.5.6
- **Language**: Java 21
- **Database**: MySQL 8.0
- **Cache**: Redis 7
- **Storage**: AWS S3
- **Security**: Spring Security + JWT
- **Build Tool**: Gradle

## 🚀 실행 방법

### 1. Docker로 실행 (권장)

자세한 내용은 [Docker 실행 가이드](README_DOCKER.md) 참고

```bash
# 환경 변수 설정
cp .env.example .env
# .env 파일 수정

# Docker Compose로 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f app
```

### 2. 로컬에서 실행

**사전 요구사항:**
- Java 21
- MySQL 8.0 (실행 중)
- Redis (실행 중)

```bash
# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 수정

# 빌드 및 실행
./gradlew bootRun
```

## 📚 API 문서

[API 명세서](API_SPECIFICATION.md) 참고

## 🔑 환경 변수

필수 환경 변수는 `.env.example` 파일 참고

- Database (MySQL)
- Redis
- JWT Secret
- AWS S3 (버킷, 액세스 키)
- Email (SMTP)
- NEIS API Key

## 📁 프로젝트 구조

```
src/main/java/com/example/gbswer/
├── config/          # 설정 (Security, Redis, S3, etc.)
├── controller/      # REST API 컨트롤러
├── dto/            # 데이터 전송 객체
├── entity/         # JPA 엔티티
├── repository/     # JPA 레포지토리
├── security/       # JWT 인증 필터
├── service/        # 비즈니스 로직
└── util/           # 유틸리티
```

## 🤝 기여

이 프로젝트는 경북소프트웨어마이스터고등학교 학생들을 위한 서비스입니다.

## 📝 라이선스

All rights reserved.
