# 공용 페이지 수정 사항 설계

## 개요

학생 페이지와 관리자 페이지 모두에 적용되는 공용 기능 수정 사항에 대한 설계입니다. 메인 페이지의 캘린더 기능, 일정표 체크박스 동작, 정보 수정 모달 UI, 프로필 UI 개선, 커뮤니티 페이지 전면 재설계를 포함합니다.

## 아키텍처

### 컴포넌트 구조

```
src/
├── components/
│   ├── Calendar/
│   │   ├── Calendar.jsx (메인 캘린더 컴포넌트)
│   │   ├── Calendar.css
│   │   └── ScheduleDetailModal.jsx (일정 상세 모달)
│   ├── Schedule/
│   │   ├── WeeklySchedule.jsx (주간 일정표)
│   │   └── WeeklySchedule.css
│   ├── Header/
│   │   ├── Header.jsx (프로필 UI 포함)
│   │   └── Header.css
│   └── UserProfileModal/
│       ├── UserProfileModal.jsx (정보 수정 모달)
│       └── UserProfileModal.css
├── pages/
│   └── Community/
│       ├── CommunityListPage.jsx (글 목록)
│       ├── CommunityWritePage.jsx (글 작성)
│       ├── CommunityReadPage.jsx (글 조회)
│       ├── CommunityEditPage.jsx (글 수정)
│       └── Community.css
└── utils/
    └── permissionUtils.js (권한 검증 유틸)
```

## 컴포넌트 및 인터페이스

### 1. Calendar 컴포넌트 개선

**현재 문제**: 캘린더에서 날짜별 일정 목록은 표시되지만, 일정 클릭 시 상세 모달이 열리지 않음

**개선 사항**:
- 일정 목록의 각 일정에 클릭 이벤트 핸들러 추가
- 클릭 시 `ScheduleDetailModal` 컴포넌트 활성화
- 모달에 선택된 일정의 상세 정보 전달

**구현 흐름**:
```
Calendar 컴포넌트
├── 날짜 클릭 → 일정 목록 표시
├── 일정 클릭 → onScheduleClick 핸들러 호출
└── ScheduleDetailModal 열기 (선택된 일정 데이터 전달)
```

### 2. WeeklySchedule 컴포넌트 개선

**현재 문제**: 추가 체크박스가 체크되지 않았을 때도 모든 일정이 표시됨

**개선 사항**:
- 체크박스 상태를 `useState`로 관리
- 체크박스 상태에 따라 일정 필터링 로직 적용
- 체크박스 상태를 localStorage에 저장하여 페이지 새로고침 시에도 유지

**필터링 로직**:
```javascript
const filteredSchedules = additionalCheckbox 
  ? schedules 
  : schedules.filter(schedule => !schedule.isAdditional);
```

### 3. UserProfileModal 컴포넌트 개선

**현재 문제**: 로그아웃 버튼의 위치가 혼란스러움

**개선 사항**:
- 버튼 레이아웃을 명확한 순서로 정렬
- 로그아웃 버튼을 비밀번호 수정하기 버튼의 왼쪽에 배치
- 버튼들 간의 시각적 계층 구조 개선

**버튼 배치 순서**:
1. 정보 수정 필드들
2. 비밀번호 수정하기 버튼
3. 로그아웃 버튼 (왼쪽)
4. 닫기 버튼 (오른쪽)

### 4. Header 컴포넌트 - 프로필 UI 개선

**현재 문제**: 프로필 클릭 시 로그아웃 버튼만 단독으로 노출됨

**개선 사항**:
- 프로필 정보 박스 컴포넌트 생성
- 프로필 사진, 이름, 아이디를 포함한 통합 UI 구성
- 로그아웃 버튼과 정보 수정하기 버튼을 박스 내에 포함
- 박스 외부 클릭 시 닫기 기능

**프로필 정보 박스 구조**:
```
┌─────────────────────────┐
│  [프로필 사진]  이름     │
│                아이디    │
├─────────────────────────┤
│ [정보 수정하기] [로그아웃]│
└─────────────────────────┘
```

### 5. Community 페이지 구조 재설계

**현재 문제**: 커뮤니티 기능 전반에서 오류 다수 발생

**개선 사항**:
- 컴포넌트 기반 구조에서 페이지 기반 구조로 변경
- 명확한 권한 정책 구현
- 각 페이지별 독립적인 상태 관리

#### 5-1. 권한 정책 구현

```javascript
const permissionPolicy = {
  author: ['read', 'comment', 'edit', 'delete'],
  admin: ['read', 'comment', 'delete'], // edit 불가
  user: ['read', 'comment', 'download', 'preview'],
  related: ['read', 'comment', 'delete']
};
```

#### 5-2. 페이지 구조

**CommunityListPage**: 글 목록 표시
- 글 목록 테이블/카드 표시
- 글 작성 버튼
- 검색 및 필터링 기능
- 조회수 표시

**CommunityWritePage**: 글 작성
- 제목, 내용, 파일 첨부 입력 필드
- 작성 완료 버튼
- 취소 버튼

**CommunityReadPage**: 글 조회
- 글 제목, 내용, 작성자, 작성일, 조회수 표시
- 권한에 따른 버튼 표시 (수정, 삭제, 댓글)
- 댓글 목록 및 댓글 작성 폼
- 파일 다운로드/미리보기 기능

**CommunityEditPage**: 글 수정
- 기존 글 정보 로드
- 제목, 내용, 파일 첨부 수정
- 수정 완료 버튼
- 취소 버튼

#### 5-3. 댓글 기능

- 글 조회 페이지 내에 댓글 섹션 포함
- 댓글 작성 폼
- 댓글 목록 (작성자, 내용, 작성일)
- 권한에 따른 댓글 삭제 기능

## 데이터 모델

### Schedule 모델
```javascript
{
  id: string,
  title: string,
  startTime: string (HH:mm),
  endTime: string (HH:mm),
  description: string,
  isAdditional: boolean
}
```

### CommunityPost 모델
```javascript
{
  id: string,
  title: string,
  content: string,
  authorId: string,
  authorName: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  viewCount: number,
  attachments: File[],
  comments: Comment[]
}
```

### Comment 모델
```javascript
{
  id: string,
  postId: string,
  authorId: string,
  authorName: string,
  content: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### UserProfile 모델
```javascript
{
  id: string,
  name: string,
  userId: string,
  profileImage: string,
  email: string,
  role: 'student' | 'admin'
}
```

## 정확성 속성 (Correctness Properties)

정확성 속성은 시스템이 만족해야 하는 형식적 명세입니다. 이는 인간이 읽을 수 있는 명세와 기계가 검증 가능한 정확성 보장 사이의 다리 역할을 합니다.

### Property 1: 일정 상세 모달 표시

**설명**: 캘린더에서 일정을 클릭하면 해당 일정의 상세 모달이 반드시 열려야 합니다.

*For any* 일정 객체와 Calendar 컴포넌트, 일정을 클릭했을 때 ScheduleDetailModal이 활성화되고 선택된 일정의 정보가 모달에 전달되어야 합니다.

**Validates: Requirements 1.2, 1.3, 1.4**

### Property 2: 체크박스 필터링 동작

**설명**: 일정표의 추가 체크박스 상태에 따라 일정 표시 여부가 정확하게 제어되어야 합니다.

*For any* 일정 목록과 체크박스 상태, 체크박스가 체크되지 않으면 추가 일정(isAdditional=true)은 표시되지 않아야 하고, 체크되면 모든 일정이 표시되어야 합니다.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: 체크박스 상태 지속성

**설명**: 일정표의 체크박스 상태는 페이지 새로고침 후에도 유지되어야 합니다.

*For any* 체크박스 상태 변경, localStorage에 저장된 상태와 현재 UI의 상태가 일치해야 하며, 페이지 새로고침 후에도 동일한 상태가 복원되어야 합니다.

**Validates: Requirements 2.4**

### Property 4: 프로필 정보 박스 통합성

**설명**: 프로필 클릭 시 표시되는 UI는 프로필 사진, 이름, 아이디, 로그아웃 버튼, 정보 수정하기 버튼을 모두 포함한 하나의 통합된 박스여야 합니다.

*For any* 프로필 클릭 이벤트, 표시되는 박스에 프로필 사진, 이름, 아이디, 로그아웃 버튼, 정보 수정하기 버튼이 모두 포함되어야 합니다.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 5: 프로필 박스 닫기 동작

**설명**: 프로필 정보 박스 외부를 클릭하면 박스가 닫혀야 합니다.

*For any* 프로필 정보 박스가 열린 상태에서 박스 외부를 클릭했을 때, 박스가 닫혀야 합니다.

**Validates: Requirements 4.5**

### Property 6: 커뮤니티 권한 정책 - 글쓴이

**설명**: 글쓴이는 자신의 글에 대해 조회, 댓글, 수정, 삭제 기능을 모두 사용할 수 있어야 합니다.

*For any* 글 객체와 현재 사용자가 글쓴이인 경우, 조회, 댓글, 수정, 삭제 버튼이 모두 표시되어야 합니다.

**Validates: Requirements 5.1.1**

### Property 7: 커뮤니티 권한 정책 - 관리자

**설명**: 관리자는 타인의 글에 대해 조회, 댓글, 삭제 기능을 사용할 수 있지만 수정은 불가능해야 합니다.

*For any* 글 객체와 현재 사용자가 관리자이며 글쓴이가 아닌 경우, 조회, 댓글, 삭제 버튼은 표시되지만 수정 버튼은 표시되지 않아야 합니다.

**Validates: Requirements 5.1.2**

### Property 8: 커뮤니티 권한 정책 - 일반 사용자

**설명**: 일반 사용자는 타인의 글에 대해 조회, 댓글, 파일 다운로드/미리보기만 가능해야 합니다.

*For any* 글 객체와 현재 사용자가 일반 사용자이며 글쓴이가 아닌 경우, 조회, 댓글, 파일 다운로드/미리보기 기능만 제공되어야 하고 수정, 삭제 버튼은 표시되지 않아야 합니다.

**Validates: Requirements 5.1.3, 5.1.4**

### Property 9: 커뮤니티 조회수 증가

**설명**: 글이 조회될 때마다 조회수가 정확하게 증가해야 합니다.

*For any* 글 객체, 글 조회 페이지가 로드될 때마다 조회수가 1씩 증가해야 하며, 글 목록에 표시되는 조회수와 실제 조회수가 일치해야 합니다.

**Validates: Requirements 5.3.1, 5.3.2**

### Property 10: 커뮤니티 페이지 네비게이션

**설명**: 커뮤니티 페이지 간의 네비게이션이 정확하게 동작해야 합니다.

*For any* 사용자 액션 (글 작성 버튼 클릭, 글 클릭, 수정 버튼 클릭), 해당하는 페이지로 정확하게 이동해야 합니다.

**Validates: Requirements 5.2.1, 5.2.2, 5.2.3, 5.2.4**

## 오류 처리

### Calendar 컴포넌트
- 일정 데이터가 없을 경우: "일정이 없습니다" 메시지 표시
- 모달 열기 실패: 콘솔 에러 로깅 및 사용자 알림

### WeeklySchedule 컴포넌트
- localStorage 접근 실패: 기본값 사용
- 필터링 오류: 모든 일정 표시

### Community 페이지
- 권한 검증 실패: 해당 기능 버튼 비활성화
- 글 로드 실패: 에러 메시지 표시
- 댓글 작성 실패: 사용자 알림 및 재시도 옵션 제공

## 테스트 전략

### 단위 테스트 (Unit Tests)

1. **Calendar 컴포넌트**
   - 일정 클릭 시 모달 활성화 테스트
   - 모달 닫기 테스트
   - 일정 데이터 전달 테스트

2. **WeeklySchedule 컴포넌트**
   - 체크박스 상태 변경 테스트
   - 필터링 로직 테스트
   - localStorage 저장/복원 테스트

3. **Header/프로필 UI**
   - 프로필 박스 표시/숨김 테스트
   - 박스 외부 클릭 시 닫기 테스트
   - 모든 요소 포함 여부 테스트

4. **Community 페이지**
   - 권한 정책 검증 테스트
   - 페이지 네비게이션 테스트
   - 조회수 증가 테스트

### 속성 기반 테스트 (Property-Based Tests)

1. **Property 1**: 일정 상세 모달 표시
   - 임의의 일정 객체 생성
   - 클릭 이벤트 시뮬레이션
   - 모달 활성화 및 데이터 전달 검증

2. **Property 2**: 체크박스 필터링 동작
   - 임의의 일정 목록 생성
   - 체크박스 상태 변경
   - 필터링 결과 검증

3. **Property 3**: 체크박스 상태 지속성
   - 체크박스 상태 변경
   - localStorage 저장 확인
   - 페이지 새로고침 후 상태 복원 검증

4. **Property 4-5**: 프로필 정보 박스
   - 프로필 클릭 시 박스 표시 검증
   - 모든 요소 포함 여부 검증
   - 외부 클릭 시 닫기 검증

5. **Property 6-9**: 커뮤니티 권한 및 기능
   - 다양한 사용자 역할에 따른 권한 검증
   - 조회수 증가 검증
   - 페이지 네비게이션 검증
