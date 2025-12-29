# GBSWER 백엔드 API 명세서 (Mock 기반)

본 문서는 프론트엔드 Mock 데이터를 기반으로 작성된 백엔드 API 구현 가이드입니다.
실제 백엔드에서 구현해야 할 API 엔드포인트, 요청/응답 구조, 데이터 필드를 상세히 기술합니다.

---

## 공통 사항

### 인증 방식
- **Authorization**: `Bearer {JWT_TOKEN}`
- **권한 레벨**: STUDENT, TEACHER, ADMIN

### 응답 포맷
```json
{
  "status": "OK",
  "message": null,
  "data": { ... }
}
```

---

## 1. 공지사항 API

### 1.1 오늘 공지사항 조회
- **GET** `/api/classes/notices/today`
- **권한**: STUDENT, TEACHER, ADMIN
- **응답**:
```json
{
  "status": "OK",
  "data": [
    {
      "id": 1,
      "title": "2025년 겨울방학 안내",
      "content": "2025년 겨울방학 기간은 2025년 1월 1일부터 2월 28일까지입니다...",
      "createdAt": "2025-12-28T09:00:00",
      "noticeDate": "2025-12-28T00:00:00",
      "author": "관리자",
      "category": "일반"
    }
  ]
}
```

### 1.2 이번주 생성된 공지사항 조회
- **GET** `/api/classes/notices/created-this-week`
- **권한**: STUDENT, TEACHER, ADMIN
- **응답**: 위와 동일한 구조

### 1.3 공지사항 생성
- **POST** `/api/classes/notices`
- **권한**: TEACHER, ADMIN
- **요청**:
```json
{
  "title": "공지사항 제목",
  "content": "공지사항 내용",
  "category": "일반",
  "author": "관리자",
  "noticeDate": "2025-12-28T00:00:00"
}
```
- **응답**:
```json
{
  "status": "OK",
  "data": {
    "id": 123,
    "title": "공지사항 제목",
    "content": "공지사항 내용",
    "createdAt": "2025-12-28T10:30:00",
    "noticeDate": "2025-12-28T00:00:00",
    "author": "관리자",
    "category": "일반"
  }
}
```

---

## 2. 클래스룸 API

### 2.1 관리자용 클래스 목록 조회
- **GET** `/api/classes/admin`
- **권한**: ADMIN
- **응답**:
```json
{
  "status": "OK",
  "data": [
    {
      "id": 1,
      "className": "프론트엔드 개발 기초",
      "classCode": "FE101",
      "teacherName": "김교수",
      "teacherId": 1,
      "participantCount": 25,
      "createdAt": "2025-12-01T09:00:00",
      "participants": [
        {
          "id": 1,
          "studentName": "학생1",
          "studentNumber": "2025001"
        }
      ],
      "posts": [
        {
          "id": 1,
          "type": "공지",
          "title": "환영합니다!",
          "content": "프론트엔드 개발 기초 클래스에 오신 것을 환영합니다.",
          "createdAt": "2025-12-01T10:00:00"
        }
      ]
    }
  ]
}
```

### 2.2 선생님용 클래스 목록 조회
- **GET** `/api/classes/teacher`
- **권한**: TEACHER, ADMIN
- **응답**: 위와 동일한 구조 (해당 선생님의 클래스만)

### 2.3 클래스 생성
- **POST** `/api/classes/create`
- **권한**: TEACHER, ADMIN
- **요청**:
```json
{
  "className": "클래스 이름",
  "classCode": "CLASS001"
}
```
- **응답**:
```json
{
  "status": "OK",
  "data": {
    "id": 123,
    "className": "클래스 이름",
    "classCode": "CLASS001",
    "teacherName": "선생님 이름",
    "teacherId": 1,
    "participantCount": 0,
    "createdAt": "2025-12-28T10:30:00",
    "participants": [],
    "posts": []
  }
}
```

### 2.4 클래스 삭제
- **DELETE** `/api/classes/{classId}`
- **권한**: TEACHER, ADMIN
- **응답**:
```json
{
  "status": "OK",
  "message": "클래스가 삭제되었습니다."
}
```

### 2.5 클래스 상세 조회
- **GET** `/api/classes/{classId}`
- **권한**: STUDENT, TEACHER, ADMIN
- **응답**: 클래스 객체 (위 구조)

---

## 3. 게시물 API

### 3.1 클래스 게시물 목록 조회
- **GET** `/api/classes/{classId}/posts?type={type}`
- **권한**: STUDENT, TEACHER, ADMIN
- **쿼리 파라미터**:
  - `type`: "공지" | "과제" | 생략시 전체
- **응답**:
```json
{
  "status": "OK",
  "data": [
    {
      "id": 1,
      "type": "공지",
      "title": "환영합니다!",
      "content": "프론트엔드 개발 기초 클래스에 오신 것을 환영합니다.",
      "createdAt": "2025-12-01T10:00:00"
    },
    {
      "id": 2,
      "type": "과제",
      "title": "HTML/CSS 기본 실습",
      "content": "간단한 웹페이지를 만들어 제출해주세요.",
      "createdAt": "2025-12-02T14:00:00",
      "dueDate": "2025-12-10T23:59:00"
    }
  ]
}
```

### 3.2 게시물 생성
- **POST** `/api/classes/{classId}/posts`
- **권한**: TEACHER, ADMIN
- **요청**:
```json
{
  "type": "공지",
  "title": "게시물 제목",
  "content": "게시물 내용",
  "dueDate": "2025-12-10T23:59:00"  // 과제인 경우
}
```
- **응답**:
```json
{
  "status": "OK",
  "data": {
    "id": 123,
    "type": "공지",
    "title": "게시물 제목",
    "content": "게시물 내용",
    "createdAt": "2025-12-28T10:30:00",
    "dueDate": "2025-12-10T23:59:00"
  }
}
```

### 3.3 게시물 수정
- **PUT** `/api/classes/{classId}/posts/{postId}`
- **권한**: TEACHER, ADMIN
- **요청**: 생성과 동일한 구조
- **응답**: 수정된 게시물 객체

### 3.4 게시물 삭제
- **DELETE** `/api/classes/{classId}/posts/{postId}`
- **권한**: TEACHER, ADMIN
- **응답**:
```json
{
  "status": "OK",
  "message": "게시물이 삭제되었습니다."
}
```

---

## 4. 일정 API

### 4.1 월별 일정 조회
- **GET** `/api/schedule?year={year}&month={month}`
- **권한**: STUDENT, TEACHER, ADMIN
- **응답**:
```json
{
  "status": "OK",
  "data": [
    {
      "id": 1,
      "title": "기말고사",
      "startDate": "2025-12-20",
      "endDate": "2025-12-20",
      "memo": "1교시부터 4교시",
      "category": "시험",
      "color": "#FF6B6B",
      "showInSchedule": true,
      "userId": 123
    }
  ]
}
```

### 4.2 일정 생성
- **POST** `/api/schedule/add`
- **권한**: STUDENT, TEACHER, ADMIN
- **요청**: 위 객체 구조 (id 제외)
- **응답**: 생성된 일정 객체

### 4.3 일정 수정
- **PUT** `/api/schedule/{id}`
- **권한**: STUDENT, TEACHER, ADMIN
- **요청**: 일정 객체
- **응답**: 수정된 일정 객체

### 4.4 일정 삭제
- **DELETE** `/api/schedule/{id}`
- **권한**: STUDENT, TEACHER, ADMIN
- **응답**: 성공 메시지

---

## 5. 사용자 API

### 5.1 프로필 조회
- **GET** `/api/user/profile`
- **권한**: STUDENT, TEACHER, ADMIN
- **응답**:
```json
{
  "status": "OK",
  "data": {
    "id": 123,
    "name": "홍길동",
    "email": "hong@example.com",
    "userId": "student001",
    "major": "컴퓨터공학과",
    "grade": 2,
    "classNumber": 3,
    "role": "STUDENT",
    "profileImage": "/profile.png"
  }
}
```

### 5.2 프로필 수정
- **PUT** `/api/user/profile`
- **권한**: STUDENT, TEACHER, ADMIN
- **요청**: 프로필 객체 (일부 필드)
- **응답**: 수정된 프로필 객체

---

## 데이터베이스 엔티티 구조

### Notice (공지사항)
```sql
CREATE TABLE notices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  notice_date DATETIME NOT NULL,
  author VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT '일반'
);
```

### Class (클래스)
```sql
CREATE TABLE classes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  class_name VARCHAR(255) NOT NULL,
  class_code VARCHAR(50) UNIQUE NOT NULL,
  teacher_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);
```

### Post (게시물)
```sql
CREATE TABLE posts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  class_id BIGINT NOT NULL,
  type ENUM('공지', '과제') NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  due_date DATETIME NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id)
);
```

### User (사용자)
```sql
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  major VARCHAR(100),
  grade INT,
  class_number INT,
  role ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL,
  profile_image VARCHAR(500),
  created_at DATETIME NOT NULL
);
```

### Schedule (일정)
```sql
CREATE TABLE schedules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  memo TEXT,
  category VARCHAR(50),
  color VARCHAR(20),
  show_in_schedule BOOLEAN DEFAULT TRUE,
  user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 구현 우선순위

### 1단계: 기본 인증 및 사용자 관리
- [ ] JWT 인증 구현
- [ ] 사용자 CRUD API
- [ ] 프로필 관리 API

### 2단계: 공지사항 시스템
- [ ] 공지사항 CRUD API
- [ ] 오늘/이번주 공지사항 조회

### 3단계: 클래스룸 시스템
- [ ] 클래스 CRUD API
- [ ] 게시물 CRUD API
- [ ] 참여자 관리 API

### 4단계: 일정 관리
- [ ] 일정 CRUD API
- [ ] 월별 일정 조회

### 5단계: 파일 업로드 및 고급 기능
- [ ] 파일 업로드 API
- [ ] 제출물 평가 시스템
- [ ] 알림 시스템

---

*본 명세서는 프론트엔드 Mock 데이터를 기반으로 작성되었으며, 실제 백엔드 구현 시 요구사항에 따라 조정될 수 있습니다.*
