# 학생 페이지 수정 사항 설계

## 개요

학생 페이지에 적용되는 기능 수정 사항에 대한 설계입니다. 클래스룸 Sidebar의 역할별 기능 분리, 과제 제출 기능 개선, 참여자 정보 표시 기능을 포함합니다.

## 아키텍처

### 컴포넌트 구조

```
src/
├── components/
│   ├── ClassDetailSidebar/
│   │   ├── ClassDetailSidebar.jsx (역할별 조건부 렌더링)
│   │   ├── StudentNoticeSection.jsx (학생용 공지 영역)
│   │   ├── StudentAssignmentSection.jsx (학생용 과제 영역)
│   │   ├── AdminNoticeSection.jsx (관리자용 공지 영역)
│   │   ├── AdminAssignmentSection.jsx (관리자용 과제 영역)
│   │   └── ClassDetailSidebar.css
│   ├── AssignmentSubmitModal/
│   │   ├── AssignmentSubmitModal.jsx
│   │   └── AssignmentSubmitModal.css
│   ├── ParticipantListModal/
│   │   ├── ParticipantListModal.jsx
│   │   ├── ParticipantCard.jsx
│   │   └── ParticipantListModal.css
│   └── ...
└── utils/
    └── roleUtils.js (역할 검증 유틸)
```

## 컴포넌트 및 인터페이스

### 1. ClassDetailSidebar 컴포넌트 개선

**현재 문제**: 학생 페이지에서도 수정하기 버튼이 노출됨

**개선 사항**:
- 사용자 역할(role)에 따른 조건부 렌더링
- 학생용 섹션과 관리자용 섹션 분리
- 각 역할별 기능만 노출

**구현 흐름**:
```javascript
if (userRole === 'student') {
  return <StudentNoticeSection /> + <StudentAssignmentSection />
} else if (userRole === 'admin') {
  return <AdminNoticeSection /> + <AdminAssignmentSection />
}
```

### 2. StudentNoticeSection 컴포넌트

**기능**:
- 공지사항 목록 표시
- 읽기 전용 (버튼 없음)
- 공지사항 제목, 내용, 작성일 표시

**특징**:
- 수정하기 버튼 미노출
- 삭제 버튼 미노출
- 클릭 시 상세 조회만 가능

### 3. StudentAssignmentSection 컴포넌트

**기능**:
- 과제 목록 표시
- 과제 제출 버튼
- + 버튼 (과제 추가)
- 제출 완료 후 수정하기 버튼

**상태 관리**:
```javascript
{
  assignmentId: string,
  title: string,
  dueDate: date,
  submitted: boolean,
  submittedFile: File,
  submittedDate: date
}
```

**기능 흐름**:
1. 과제 제출 버튼 클릭 → AssignmentSubmitModal 열기
2. 파일 선택 및 제출 → 제출 완료 팝업 표시
3. 수정하기 버튼 활성화 → 제출 파일 수정 가능

### 4. AssignmentSubmitModal 컴포넌트

**기능**:
- 파일 선택 입력 필드
- 제출 버튼
- 취소 버튼

**동작**:
- 파일 선택 시 파일 정보 표시
- 제출 버튼 클릭 시 API 호출
- 성공 시 "과제 제출이 완료되었습니다." 팝업 표시
- 실패 시 에러 메시지 표시

### 5. ParticipantListModal 컴포넌트

**기능**:
- 클래스 참여 학생 목록 표시
- 각 학생의 프로필 정보 표시

**UI 구조**:
```
┌─────────────────────────────┐
│ 참여자 목록                  │
├─────────────────────────────┤
│ [프로필] 이름                │
│         아이디                │
├─────────────────────────────┤
│ [프로필] 이름                │
│         아이디                │
└─────────────────────────────┘
```

**ParticipantCard 컴포넌트**:
- 프로필 사진 (왼쪽)
- 이름 (오른쪽 위)
- 아이디 (오른쪽 아래)

## 데이터 모델

### Assignment 모델
```javascript
{
  id: string,
  classId: string,
  title: string,
  description: string,
  dueDate: timestamp,
  createdAt: timestamp,
  attachments: File[]
}
```

### AssignmentSubmission 모델
```javascript
{
  id: string,
  assignmentId: string,
  studentId: string,
  submittedFile: File,
  submittedDate: timestamp,
  updatedDate: timestamp
}
```

### Participant 모델
```javascript
{
  id: string,
  classId: string,
  userId: string,
  name: string,
  profileImage: string,
  role: 'student' | 'admin'
}
```

## 정확성 속성 (Correctness Properties)

정확성 속성은 시스템이 만족해야 하는 형식적 명세입니다.

### Property 1: 학생 페이지 수정 버튼 미노출

**설명**: 학생 페이지에서는 공지사항과 과제 영역에 수정하기 버튼이 노출되지 않아야 합니다.

*For any* 학생 사용자와 ClassDetailSidebar 컴포넌트, 공지사항 영역과 과제 영역에 수정하기 버튼이 렌더링되지 않아야 합니다.

**Validates: Requirements 1.1, 1.2**

### Property 2: 관리자 페이지 수정 버튼 노출

**설명**: 관리자 페이지에서는 공지사항과 과제 영역에 수정하기 버튼이 노출되어야 합니다.

*For any* 관리자 사용자와 ClassDetailSidebar 컴포넌트, 공지사항 영역과 과제 영역에 수정하기 버튼이 렌더링되어야 합니다.

**Validates: Requirements 1.3, 1.4**

### Property 3: 학생 공지 영역 읽기 전용

**설명**: 학생 페이지의 공지 영역에는 어떠한 버튼도 표시되지 않아야 합니다.

*For any* 학생 사용자와 StudentNoticeSection 컴포넌트, 공지사항 목록에 수정, 삭제, 추가 버튼이 렌더링되지 않아야 합니다.

**Validates: Requirements 2.1, 2.2**

### Property 4: 과제 제출 버튼 노출

**설명**: 학생 페이지의 과제 영역에는 과제 제출 버튼이 노출되어야 합니다.

*For any* 학생 사용자와 StudentAssignmentSection 컴포넌트, 과제 제출 버튼이 렌더링되어야 합니다.

**Validates: Requirements 3.1**

### Property 5: 과제 제출 모달 동작

**설명**: 과제 제출 버튼 클릭 시 AssignmentSubmitModal이 열려야 합니다.

*For any* 과제 제출 버튼 클릭 이벤트, AssignmentSubmitModal이 활성화되고 파일 선택 입력 필드가 표시되어야 합니다.

**Validates: Requirements 3.2**

### Property 6: 과제 제출 완료 팝업

**설명**: 과제 제출 완료 시 "과제 제출이 완료되었습니다." 팝업이 표시되어야 합니다.

*For any* 과제 제출 성공 이벤트, 팝업이 표시되고 메시지가 정확하게 표시되어야 합니다.

**Validates: Requirements 3.4**

### Property 7: 제출 파일 수정 기능

**설명**: 과제 제출 후 수정하기 버튼을 통해 제출 파일을 수정할 수 있어야 합니다.

*For any* 제출된 과제, 수정하기 버튼이 활성화되고 클릭 시 파일 수정 모달이 열려야 합니다.

**Validates: Requirements 3.5**

### Property 8: 과제 추가 기능

**설명**: + 버튼 클릭 시 과제를 추가할 수 있어야 합니다.

*For any* + 버튼 클릭 이벤트, 과제 추가 모달이 열려야 합니다.

**Validates: Requirements 3.7**

### Property 9: 참여자 정보 리스트 표시

**설명**: participant-info 클릭 시 해당 클래스의 모든 참여 학생 정보가 표시되어야 합니다.

*For any* participant-info 클릭 이벤트, ParticipantListModal이 활성화되고 모든 참여 학생의 정보가 표시되어야 합니다.

**Validates: Requirements 4.1, 4.4**

### Property 10: 참여자 카드 UI 구성

**설명**: 참여자 카드는 프로필 사진(왼쪽), 이름과 아이디(오른쪽, 세로 정렬)로 구성되어야 합니다.

*For any* 참여자 정보, ParticipantCard에 프로필 사진이 왼쪽에, 이름과 아이디가 오른쪽에 세로 정렬로 표시되어야 합니다.

**Validates: Requirements 4.2, 4.3**

## 오류 처리

### StudentAssignmentSection
- 과제 데이터 로드 실패: "과제를 불러올 수 없습니다" 메시지 표시
- 제출 실패: 에러 메시지 표시 및 재시도 옵션 제공

### AssignmentSubmitModal
- 파일 선택 실패: "파일을 선택해주세요" 메시지 표시
- 제출 실패: 에러 메시지 표시

### ParticipantListModal
- 참여자 데이터 로드 실패: "참여자 정보를 불러올 수 없습니다" 메시지 표시
- 참여자가 없는 경우: "참여자가 없습니다" 메시지 표시

## 테스트 전략

### 단위 테스트 (Unit Tests)

1. **ClassDetailSidebar 컴포넌트**
   - 학생 역할 시 수정 버튼 미노출 테스트
   - 관리자 역할 시 수정 버튼 노출 테스트
   - 역할별 섹션 렌더링 테스트

2. **StudentNoticeSection 컴포넌트**
   - 공지사항 목록 표시 테스트
   - 버튼 미노출 테스트

3. **StudentAssignmentSection 컴포넌트**
   - 과제 목록 표시 테스트
   - 과제 제출 버튼 노출 테스트
   - + 버튼 기능 테스트

4. **AssignmentSubmitModal 컴포넌트**
   - 모달 열기/닫기 테스트
   - 파일 선택 테스트
   - 제출 완료 팝업 표시 테스트

5. **ParticipantListModal 컴포넌트**
   - 모달 열기/닫기 테스트
   - 참여자 목록 표시 테스트
   - 참여자 카드 UI 테스트

### 속성 기반 테스트 (Property-Based Tests)

1. **Property 1-2**: 역할별 버튼 노출
   - 다양한 사용자 역할에 따른 버튼 노출 검증

2. **Property 3**: 학생 공지 영역 읽기 전용
   - 공지 영역에 버튼이 없는지 검증

3. **Property 4-8**: 과제 제출 기능
   - 과제 제출 버튼 노출 검증
   - 모달 열기 검증
   - 제출 완료 팝업 검증
   - 파일 수정 기능 검증

4. **Property 9-10**: 참여자 정보 표시
   - 참여자 리스트 표시 검증
   - 카드 UI 구성 검증
