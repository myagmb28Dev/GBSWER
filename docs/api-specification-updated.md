# GBSWER 백엔드 API 명세서

본 문서는 GBSWER 백엔드에서 구현된 API 엔드포인트, 요청/응답 구조, 데이터 필드를 상세히 기술합니다.

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

## 1. 클래스룸 API

### 1.1 클래스 생성
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

### 1.2 클래스 참여
- **POST** `/api/classes/join`
- **권한**: STUDENT
- **요청**:
```json
{
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
    "participantCount": 1,
    "createdAt": "2025-12-28T10:30:00",
    "participants": [...],
    "posts": [...]
  }
}
```

### 1.3 선생님용 클래스 목록 조회
- **GET** `/api/classes/teacher`
- **권한**: TEACHER, ADMIN
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
      "participants": [...],
      "posts": [...]
    }
  ]
}
```

### 1.4 관리자용 클래스 목록 조회
- **GET** `/api/classes/admin`
- **권한**: ADMIN
- **응답**: 위와 동일한 구조 (모든 클래스)

### 1.5 사용자용 클래스 목록 조회
- **GET** `/api/classes`
- **권한**: TEACHER, STUDENT
- **응답**: 해당 사용자의 클래스 목록

### 1.6 클래스 상세 조회
- **GET** `/api/classes/{classId}`
- **권한**: TEACHER, STUDENT
- **응답**: 클래스 객체

### 1.7 클래스 삭제
- **DELETE** `/api/classes/{classId}`
- **권한**: TEACHER, ADMIN
- **응답**:
```json
{
  "status": "OK",
  "message": "클래스가 삭제되었습니다."
}
```

### 1.8 클래스 참가자 목록 조회
- **GET** `/api/classes/{classId}/participants`
- **권한**: TEACHER, ADMIN
- **응답**:
```json
{
  "status": "OK",
  "data": [
    {
      "id": 1,
      "studentName": "학생1",
      "studentNumber": "2025001"
    }
  ]
}
```

### 1.9 참가자 퇴장
- **DELETE** `/api/classes/{classId}/participants/{studentId}`
- **권한**: TEACHER, ADMIN
- **응답**:
```json
{
  "status": "OK",
  "message": "참가자가 퇴장되었습니다."
}
```

---

## 2. 게시물 API

### 2.1 클래스 게시물 목록 조회
- **GET** `/api/classes/{classId}/posts?page=1&limit=20&type=공지`
- **권한**: TEACHER, STUDENT
- **쿼리 파라미터**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 한 페이지당 항목 수 (기본값: 20)
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

### 2.2 게시물 생성
- **POST** `/api/classes/{classId}/posts`
- **권한**: TEACHER, ADMIN
- **Content-Type**: `multipart/form-data`
- **요청 파라미터**:
  - `title`: 제목
  - `content`: 내용
  - `type`: "공지" 또는 "과제"
  - `dueDate`: 마감일 (선택, 과제인 경우)
  - `anonymous`: 익명 여부 (기본값: false)
  - `file`: 첨부 파일들 (선택)
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

### 2.3 게시물 수정
- **PUT** `/api/classes/{classId}/posts/{postId}`
- **권한**: TEACHER, ADMIN
- **Content-Type**: `multipart/form-data`
- **요청 파라미터**: 생성과 동일
- **응답**: 수정된 게시물 객체

### 2.4 게시물 삭제
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

## 3. 과제 제출 API

### 3.1 과제 제출
- **POST** `/api/classes/{classId}/posts/{postId}/submit`
- **권한**: STUDENT
- **Content-Type**: `multipart/form-data`
- **요청 파라미터**:
  - `files`: 제출 파일들
- **응답**:
```json
{
  "status": "OK",
  "data": {
    "id": 123,
    "taskId": 1,
    "taskTitle": "HTML/CSS 기본 실습",
    "studentId": 456,
    "studentName": "홍길동",
    "files": [...],
    "submittedAt": "2025-12-28T10:30:00",
    "status": "SUBMITTED"
  }
}
```

### 3.2 제출 수정
- **PUT** `/api/classes/{classId}/posts/{postId}/submit`
- **권한**: STUDENT
- **Content-Type**: `multipart/form-data`
- **요청 파라미터**: 제출과 동일
- **응답**: 수정된 제출 객체

### 3.3 제출 현황 조회
- **GET** `/api/classes/{classId}/posts/{postId}/submissions`
- **권한**: TEACHER, ADMIN
- **응답**:
```json
{
  "status": "OK",
  "data": [
    {
      "id": 123,
      "taskId": 1,
      "taskTitle": "HTML/CSS 기본 실습",
      "studentId": 456,
      "studentName": "홍길동",
      "files": [...],
      "submittedAt": "2025-12-28T10:30:00",
      "status": "SUBMITTED"
    }
  ]
}
```

### 3.4 제출 평가
- **POST** `/api/classes/{classId}/posts/{postId}/submissions/{submissionId}/review`
- **권한**: TEACHER, ADMIN
- **요청**:
```json
{
  "feedback": "잘했습니다.",
  "status": "APPROVED"
}
```
- **응답**: 평가된 제출 객체

### 3.5 내 제출물 조회
- **GET** `/api/classes/{classId}/posts/{postId}/my-submission`
- **권한**: STUDENT
- **응답**: 내 제출 객체

---

## 데이터베이스 엔티티 구조

### Task (게시물/공지사항/과제)
```sql
CREATE TABLE tasks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  teacher_name VARCHAR(100),
  due_date DATE,
  type ENUM('공지', '과제') NOT NULL,
  class_id BIGINT,
  file_path VARCHAR(500),
  file_names TEXT,
  file_urls TEXT,
  anonymous BOOLEAN DEFAULT FALSE,
  teacher_id BIGINT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
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

### Submission (제출물)
```sql
CREATE TABLE submissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  task_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  file_names TEXT,
  file_urls TEXT,
  submitted_at DATETIME,
  feedback TEXT,
  status ENUM('SUBMITTED', 'REVIEWED', 'APPROVED') DEFAULT 'SUBMITTED',
  reviewed_at DATETIME,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
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

---

*본 명세서는 실제 구현된 API를 기반으로 작성되었습니다.*
