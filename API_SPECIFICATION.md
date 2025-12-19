# GBSWER 백엔드 API 명세서

**Base URL:** `http://localhost:8080`

**인증 방식:** JWT Bearer Token (Authorization 헤더)

**공통 응답 형식:**
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

---

## 📌 1. 인증 (Auth)

### 1.1 로그인
- **Endpoint:** `POST /api/auth/login`
- **설명:** 이름과 비밀번호로 로그인
- **인증 필요:** ❌

**요청 Body:**
```json
{
  "name": "홍길동",
  "password": "password123"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

### 1.2 현재 사용자 정보 조회
- **Endpoint:** `GET /api/auth/me`
- **설명:** 로그인한 사용자 정보 반환
- **인증 필요:** ✅

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "홍길동",
    "email": "student@example.com",
    "department": "소프트웨어개발과",
    "grade": 2,
    "classNumber": 1,
    "studentNumber": 15,
    "role": "STUDENT",
    "displayInfo": "소프트웨어개발과 2학년 1반 15번"
  }
}
```

---

### 1.3 토큰 갱신
- **Endpoint:** `POST /api/auth/refresh`
- **설명:** Refresh Token으로 새 Access Token 발급
- **인증 필요:** ❌

**요청 Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

## 📌 2. 사용자 (User)

### 2.1 내 프로필 조회
- **Endpoint:** `GET /api/user/profile`
- **인증 필요:** ✅

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "홍길동",
    "email": "student@example.com",
    "department": "소프트웨어개발과",
    "grade": 2,
    "classNumber": 1,
    "studentNumber": 15,
    "role": "STUDENT"
  }
}
```

---

### 2.2 프로필 수정
- **Endpoint:** `PUT /api/user/profile`
- **인증 필요:** ✅

**요청 Body:**
```json
{
  "name": "홍길동",
  "department": "게임개발과",
  "grade": 2,
  "classNumber": 4,
  "studentNumber": 10,
  "email": "newemail@example.com"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "홍길동",
    "email": "newemail@example.com",
    "department": "게임개발과",
    "grade": 2,
    "classNumber": 4,
    "studentNumber": 10,
    "role": "STUDENT"
  }
}
```

---

### 2.3 비밀번호 변경
- **Endpoint:** `PUT /api/user/password`
- **인증 필요:** ✅

**요청 Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**응답:**
```json
{
  "success": true,
  "data": null
}
```

---

### 2.4 이메일 인증번호 전송
- **Endpoint:** `POST /api/user/email/send-code`
- **설명:** 이메일 설정을 위한 인증번호 전송
- **인증 필요:** ✅

**요청 Body:**
```json
{
  "email": "student@example.com"
}
```

**응답:**
```json
{
  "success": true,
  "data": null
}
```

---

### 2.5 이메일 인증 및 설정
- **Endpoint:** `POST /api/user/email/verify`
- **설명:** 인증번호 확인 후 이메일 설정
- **인증 필요:** ✅

**요청 Body:**
```json
{
  "email": "student@example.com",
  "code": "123456"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "홍길동",
    "email": "student@example.com",
    "department": "소프트웨어개발과"
  }
}
```

---

### 2.6 비밀번호 재설정 코드 전송
- **Endpoint:** `POST /api/user/password/reset/send-code`
- **설명:** 비밀번호 재설정용 인증번호 전송
- **인증 필요:** ❌

**요청 Body:**
```json
{
  "email": "student@example.com"
}
```

**응답:**
```json
{
  "success": true,
  "data": null
}
```

---

### 2.7 비밀번호 재설정
- **Endpoint:** `POST /api/user/password/reset/verify`
- **설명:** 인증번호 확인 후 비밀번호 재설정
- **인증 필요:** ❌

**요청 Body:**
```json
{
  "email": "student@example.com",
  "code": "123456",
  "newPassword": "newPassword789"
}
```

**응답:**
```json
{
  "success": true,
  "data": null
}
```

---

### 2.8 회원 탈퇴
- **Endpoint:** `DELETE /api/user/withdraw`
- **인증 필요:** ✅

**응답:**
```json
{
  "success": true,
  "data": null
}
```

---

### 2.9 전체 사용자 목록 (관리자 전용)
- **Endpoint:** `GET /api/user/list`
- **인증 필요:** ✅ (ADMIN)

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "홍길동",
      "email": "student@example.com",
      "department": "소프트웨어개발과",
      "role": "STUDENT"
    }
  ]
}
```

---

### 2.10 사용자 권한 변경 (관리자 전용)
- **Endpoint:** `PUT /api/user/role/{userId}`
- **인증 필요:** ✅ (ADMIN)

**요청 Body:**
```json
{
  "role": "TEACHER"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "홍길동",
    "role": "TEACHER"
  }
}
```

---

## 📌 3. 메인 대시보드

### 3.1 대시보드 조회
- **Endpoint:** `GET /api/main/`
- **설명:** 오늘의 급식, 일정, 과제 등 요약 정보
- **인증 필요:** ✅

**응답:**
```json
{
  "success": true,
  "data": {
    "todayMeal": { ... },
    "todaySchedules": [ ... ],
    "pendingTasks": [ ... ]
  }
}
```

---

## 📌 4. 커뮤니티 (Community)

### 4.1 전체 게시글 조회
- **Endpoint:** `GET /api/community/`
- **인증 필요:** ❌

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "공지사항",
      "content": "내용입니다",
      "writer": "선생님",
      "createdAt": "2025-12-18T10:00:00",
      "viewCount": 123,
      "department": "ALL",
      "imageUrls": [
        "https://s3.amazonaws.com/bucket/posts/2025/12/image1.jpg"
      ]
    }
  ]
}
```

---

### 4.2 학과별 게시글 조회
- **Endpoint:** `GET /api/community/department/{department}`
- **설명:** 특정 학과 + 전체(ALL) 게시글 조회
- **인증 필요:** ❌

**Path Parameter:**
- `department`: 학과명 (예: 소프트웨어개발과, 게임개발과, 인공지능소프트웨어과)

**응답:** 4.1과 동일

---

### 4.3 특정 학과만 게시글 조회
- **Endpoint:** `GET /api/community/department/{department}/only`
- **설명:** 특정 학과 게시글만 조회 (ALL 제외)
- **인증 필요:** ❌

**응답:** 4.1과 동일

---

### 4.4 내 학과 게시글 조회
- **Endpoint:** `GET /api/community/my-department`
- **설명:** 로그인한 사용자의 학과 게시글 조회
- **인증 필요:** ✅

**응답:** 4.1과 동일

---

### 4.5 게시글 상세 조회
- **Endpoint:** `GET /api/community/{id}`
- **인증 필요:** ❌

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "공지사항",
    "content": "내용입니다",
    "writer": "선생님",
    "createdAt": "2025-12-18T10:00:00",
    "viewCount": 124,
    "department": "소프트웨어개발과",
    "imageUrls": [
      "https://s3.amazonaws.com/bucket/posts/2025/12/image1.jpg",
      "https://s3.amazonaws.com/bucket/posts/2025/12/image2.jpg"
    ]
  }
}
```

---

### 4.6 게시글 작성
- **Endpoint:** `POST /api/community/write`
- **Content-Type:** `multipart/form-data`
- **인증 필요:** ✅ (TEACHER, STUDENT)

**요청 (Form Data):**
```
title: "게시글 제목"
content: "게시글 내용"
department: "소프트웨어개발과"  (선택, 기본값: ALL)
images: [파일1.jpg, 파일2.png]  (선택, 여러 파일 가능)
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "게시글 제목",
    "content": "게시글 내용",
    "writer": "홍길동",
    "department": "소프트웨어개발과",
    "imageUrls": [
      "https://s3.amazonaws.com/bucket/posts/2025/12/uuid1.jpg"
    ]
  }
}
```

---

### 4.7 게시글 수정
- **Endpoint:** `PUT /api/community/{id}`
- **Content-Type:** `multipart/form-data`
- **인증 필요:** ✅ (작성자 본인)

**요청 (Form Data):**
```
title: "수정된 제목"
content: "수정된 내용"
department: "게임개발과"  (선택)
images: [새파일1.jpg]  (선택, 새로 추가할 이미지)
existingImageUrls: ["https://...", "https://..."]  (선택, 유지할 기존 이미지 URL 배열)
```

**응답:** 4.6과 동일

---

### 4.8 게시글 삭제
- **Endpoint:** `DELETE /api/community/{id}`
- **인증 필요:** ✅ (작성자 본인)

**응답:**
```json
{
  "success": true,
  "data": null
}
```

---

## 📌 5. 급식 (Meal)

### 5.1 월별 급식 조회
- **Endpoint:** `GET /api/meals?year={year}&month={month}`
- **인증 필요:** ❌

**Query Parameters:**
- `year`: 연도 (예: 2025)
- `month`: 월 (예: 12)

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-12-18",
      "meals": {
        "breakfast": ["밥", "국", "반찬1"],
        "lunch": ["밥", "국", "반찬1", "반찬2"],
        "dinner": ["밥", "국", "반찬1"]
      }
    }
  ]
}
```

---

### 5.2 급식 데이터 갱신
- **Endpoint:** `POST /api/meals/refresh?year={year}&month={month}`
- **설명:** NEIS API에서 급식 데이터 새로 가져오기
- **인증 필요:** ❌

**응답:**
```json
{
  "success": true,
  "data": "2025년 12월 급식 데이터가 업데이트되었습니다."
}
```

---

## 📌 6. 학사일정 (School Event)

### 6.1 월별 학사일정 조회
- **Endpoint:** `GET /api/school-events?year={year}&month={month}`
- **인증 필요:** ❌

**Query Parameters:**
- `year`: 연도
- `month`: 월

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "eventName": "3·1절",
      "eventDate": "2025-03-01",
      "eventType": "공휴일"
    }
  ]
}
```

---

### 6.2 학사일정 데이터 갱신
- **Endpoint:** `POST /api/school-events/refresh?year={year}&month={month}`
- **인증 필요:** ❌

**응답:**
```json
{
  "success": true,
  "data": "2025년 3월 학사일정 데이터가 업데이트되었습니다."
}
```

---

## 📌 7. 개인 일정 (Schedule)

### 7.1 월별 일정 조회
- **Endpoint:** `GET /api/schedule/?year={year}&month={month}`
- **인증 필요:** ✅

**Query Parameters:**
- `year`: 연도
- `month`: 월

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "프로젝트 마감",
      "dueDate": "2025-12-20",
      "memo": "최종 제출"
    }
  ]
}
```

---

### 7.2 오늘 일정 조회
- **Endpoint:** `GET /api/schedule/today`
- **인증 필요:** ✅

**응답:** 7.1과 동일

---

### 7.3 일정 추가
- **Endpoint:** `POST /api/schedule/add`
- **인증 필요:** ✅

**요청 Body:**
```json
{
  "title": "프로젝트 마감",
  "dueDate": "2025-12-20",
  "memo": "최종 제출"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "프로젝트 마감",
    "dueDate": "2025-12-20",
    "memo": "최종 제출"
  }
}
```

---

### 7.4 일정 수정
- **Endpoint:** `PUT /api/schedule/{id}`
- **인증 필요:** ✅

**요청 Body:**
```json
{
  "title": "수정된 일정",
  "dueDate": "2025-12-21",
  "memo": "수정된 메모"
}
```

**응답:** 7.3과 동일

---

### 7.5 일정 삭제
- **Endpoint:** `DELETE /api/schedule/{id}`
- **인증 필요:** ✅

**응답:**
```json
{
  "success": true,
  "data": null
}
```

---

## 📌 8. 과제 (Task)

### 8.1 전체 과제 목록 조회
- **Endpoint:** `GET /api/task/list`
- **인증 필요:** ✅

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "자바 과제",
      "description": "스프링 부트 프로젝트 만들기",
      "teacherName": "김선생",
      "dueDate": "2025-12-25",
      "filePath": "https://s3.amazonaws.com/bucket/tasks/file.pdf"
    }
  ]
}
```

---

### 8.2 과제 상세 조회
- **Endpoint:** `GET /api/task/{id}`
- **인증 필요:** ✅

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "자바 과제",
    "description": "스프링 부트 프로젝트 만들기",
    "teacherName": "김선생",
    "dueDate": "2025-12-25",
    "filePath": "https://s3.amazonaws.com/bucket/tasks/file.pdf"
  }
}
```

---

### 8.3 과제 제출 (학생 전용)
- **Endpoint:** `POST /api/task/submit`
- **Content-Type:** `multipart/form-data`
- **인증 필요:** ✅ (STUDENT)

**요청 (Form Data):**
```
taskId: 1
file: [제출파일.pdf]
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "taskId": 1,
    "taskTitle": "자바 과제",
    "studentId": 1,
    "studentName": "홍길동",
    "fileUrl": "https://s3.amazonaws.com/bucket/submissions/uuid.pdf",
    "submittedAt": "2025-12-18T10:00:00",
    "status": "SUBMITTED"
  }
}
```

---

### 8.4 내 제출 목록 조회 (학생 전용)
- **Endpoint:** `GET /api/task/my-submissions`
- **인증 필요:** ✅ (STUDENT)

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "taskId": 1,
      "taskTitle": "자바 과제",
      "fileUrl": "https://s3.amazonaws.com/...",
      "submittedAt": "2025-12-18T10:00:00",
      "feedback": "잘했습니다",
      "status": "REVIEWED",
      "reviewedAt": "2025-12-19T14:00:00"
    }
  ]
}
```

---

### 8.5 과제 생성 (선생님 전용)
- **Endpoint:** `POST /api/task/upload`
- **Content-Type:** `multipart/form-data`
- **인증 필요:** ✅ (TEACHER)

**요청 (Form Data):**
```
request: {
  "title": "자바 과제",
  "description": "스프링 부트 프로젝트 만들기",
  "dueDate": "2025-12-25"
}
file: [첨부파일.pdf]  (선택)
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "자바 과제",
    "description": "스프링 부트 프로젝트 만들기",
    "teacherName": "김선생",
    "dueDate": "2025-12-25",
    "filePath": "https://s3.amazonaws.com/..."
  }
}
```

---

### 8.6 과제 수정 (선생님 전용)
- **Endpoint:** `PUT /api/task/{id}`
- **인증 필요:** ✅ (TEACHER)

**요청 Body:**
```json
{
  "title": "수정된 과제",
  "description": "수정된 설명",
  "dueDate": "2025-12-30"
}
```

**응답:** 8.5와 동일

---

### 8.7 과제 삭제 (선생님 전용)
- **Endpoint:** `DELETE /api/task/{id}`
- **인증 필요:** ✅ (TEACHER)

**응답:**
```json
{
  "success": true,
  "data": null
}
```

---

### 8.8 과제별 제출 목록 조회 (선생님 전용)
- **Endpoint:** `GET /api/task/submissions/{taskId}`
- **인증 필요:** ✅ (TEACHER)

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "taskId": 1,
      "studentId": 1,
      "studentName": "홍길동",
      "fileUrl": "https://s3.amazonaws.com/...",
      "submittedAt": "2025-12-18T10:00:00",
      "status": "SUBMITTED"
    }
  ]
}
```

---

### 8.9 제출물 상세 조회 (선생님 전용)
- **Endpoint:** `GET /api/task/submission/{submissionId}`
- **인증 필요:** ✅ (TEACHER)

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "taskId": 1,
    "taskTitle": "자바 과제",
    "studentId": 1,
    "studentName": "홍길동",
    "fileUrl": "https://s3.amazonaws.com/...",
    "submittedAt": "2025-12-18T10:00:00",
    "feedback": null,
    "status": "SUBMITTED"
  }
}
```

---

### 8.10 제출물 검토 (선생님 전용)
- **Endpoint:** `POST /api/task/submission/{submissionId}/review`
- **인증 필요:** ✅ (TEACHER)

**요청 Body:**
```json
{
  "feedback": "잘했습니다",
  "status": "REVIEWED"
}
```

**상태값:**
- `SUBMITTED`: 제출됨
- `REVIEWED`: 검토됨
- `APPROVED`: 승인됨

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "feedback": "잘했습니다",
    "status": "REVIEWED",
    "reviewedAt": "2025-12-19T14:00:00"
  }
}
```

---

## 📌 9. 시간표 (Timetable)

### 9.1 시간표 조회 (통합)
- **Endpoint:** `GET /api/timetable`
- **설명:** 하루 또는 일주일 시간표 조회
- **인증 필요:** ❌

**Query Parameters:**
- `date`: 날짜 (YYYYMMDD, 선택 - 없으면 일주일치)
- `department`: 학과명 (필수)
- `grade`: 학년 (필수)
- `class`: 반 번호 (필수)
- `semester`: 학기 (선택, 1 또는 2)

**예시 요청:**
```
GET /api/timetable?department=소프트웨어개발과&grade=2&class=1&semester=2
GET /api/timetable?date=20251218&department=게임개발과&grade=2&class=4&semester=1
```

**응답 (하루치):**
```json
{
  "success": true,
  "data": {
    "date": "2025-12-18",
    "dayOfWeek": "수요일",
    "classes": [
      {
        "period": 1,
        "subject": "자바프로그래밍",
        "teacher": "김선생"
      },
      {
        "period": 2,
        "subject": "데이터베이스",
        "teacher": "이선생"
      }
    ]
  }
}
```

**응답 (일주일치):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-12-16",
      "dayOfWeek": "월요일",
      "classes": [ ... ]
    },
    {
      "date": "2025-12-17",
      "dayOfWeek": "화요일",
      "classes": [ ... ]
    }
  ]
}
```

---

### 9.2 하루 시간표 조회
- **Endpoint:** `GET /api/timetable/daily`
- **설명:** 특정 날짜 시간표 (날짜 없으면 오늘)
- **인증 필요:** ❌

**Query Parameters:**
- `date`: 날짜 (YYYYMMDD, 선택)
- `department`: 학과명 (필수)
- `grade`: 학년 (필수)
- `class`: 반 번호 (필수)
- `semester`: 학기 (선택)

**응답:** 9.1의 하루치 응답과 동일

---

### 9.3 주간 시간표 조회
- **Endpoint:** `GET /api/timetable/weekly`
- **설명:** 일주일 시간표 조회
- **인증 필요:** ❌

**Query Parameters:**
- `startDate`: 시작 날짜 (YYYYMMDD, 선택)
- `days`: 조회 일수 (선택, 기본 7일)
- `department`: 학과명 (필수)
- `grade`: 학년 (필수)
- `class`: 반 번호 (필수)
- `semester`: 학기 (선택)

**응답:** 9.1의 일주일치 응답과 동일

---

## 📌 10. 학생 관리 (Student - 선생님 전용)

### 10.1 학생 목록 조회
- **Endpoint:** `GET /api/student/list`
- **인증 필요:** ✅ (TEACHER)

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "홍길동",
      "department": "소프트웨어개발과",
      "grade": 2,
      "classNumber": 1,
      "studentNumber": 15
    }
  ]
}
```

---

### 10.2 학생 과제 조회
- **Endpoint:** `GET /api/student/{studentId}/tasks`
- **인증 필요:** ✅ (TEACHER)

**응답:** 8.4와 동일

---

### 10.3 학생 프로필 조회
- **Endpoint:** `GET /api/student/{studentId}/profile`
- **인증 필요:** ✅ (TEACHER)

**응답:** 2.1과 동일

---

## 📝 프론트엔드 요청사항

### ✅ 필수 제공 사항

1. **Authorization 헤더**
   - 로그인 후 모든 인증 필요 API 호출 시 포함
   ```
   Authorization: Bearer {accessToken}
   ```

2. **이미지 업로드 (커뮤니티, 과제)**
   - Content-Type: `multipart/form-data`
   - FormData 객체 사용

3. **날짜 형식**
   - 시간표 조회: `YYYYMMDD` (예: 20251218)
   - 일정/과제 마감일: `YYYY-MM-DD` (예: 2025-12-18)

4. **학과명**
   - 정확한 문자열 사용
   - 예: `소프트웨어개발과`, `게임개발과`, `인공지능소프트웨어과`

5. **에러 처리**
   - `success: false` 시 `error` 필드 확인
   ```json
   {
     "success": false,
     "data": null,
     "error": "에러 메시지"
   }
   ```

---

### 🔄 반 번호 매핑 정보

**프론트에서 표시하는 반 번호 ≠ 내부 처리 반 번호**

| 학과 | 학년 | 프론트 표시 반 | 시간표 API 전달 반 |
|------|------|----------------|-------------------|
| 소프트웨어개발과 | 2 | 1반 | class=1 |
| 소프트웨어개발과 | 2 | 2반 | class=2 |
| 인공지능소프트웨어과 | 2 | 3반 | class=1 |
| 게임개발과 | 2 | 4반 | class=1 |

**주의:** 프론트는 사용자에게 실제 반 번호(1,2,3,4)를 보여주되, 시간표 API 호출 시에는 위 매핑 테이블에 따라 변환하여 전달해야 합니다.

---

### 📌 기타 참고사항

- **파일 업로드**: 이미지는 S3에 저장되며 URL로 반환됩니다
- **이미지 여러 개 업로드**: `images[]` 배열로 전송
- **토큰 만료**: 401 에러 시 `/api/auth/refresh`로 토큰 갱신
- **권한 오류**: 403 에러 시 권한 없음 처리

