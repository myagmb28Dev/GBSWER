# 관리자 페이지 수정 사항 설계

## 개요

관리자 페이지에 적용되는 기능 수정 사항에 대한 설계입니다. 메인 페이지 레이아웃 오류 수정, 커뮤니티 상단 안내 박스 제거, 클래스룸 Sidebar 개선, 마이페이지 수정을 포함합니다.

## 아키텍처

### 컴포넌트 구조

```
src/
├── pages/
│   ├── Main/
│   │   ├── Admin/
│   │   │   ├── MainBoard.jsx (관리자 메인 페이지)
│   │   │   └── MainBoard.css
│   │   └── MainBoard.jsx (학생 메인 페이지 - 참조)
│   ├── Classroom/
│   │   ├── Admin/
│   │   │   ├── ClassroomBoard.jsx
│   │   │   └── ClassroomBoard.css
│   │   └── ...
│   ├── Community/
│   │   ├── Admin/
│   │   │   ├── CommunityListPage.jsx
│   │   │   └── Community.css
│   │   └── ...
│   └── MyPage/
│       ├── Admin/
│       │   ├── MyPageBoard.jsx
│       │   └── MyPageBoard.css
│       └── ...
├── components/
│   ├── ClassDetailSidebar/
│   │   ├── AdminNoticeSection.jsx
│   │   ├── AdminAssignmentSection.jsx
│   │   ├── AssignmentStatusModal.jsx
│   │   └── ClassDetailSidebar.css
│   ├── AdminClassModal/
│   │   ├── AdminClassModal.jsx
│   │   └── AdminClassModal.css
│   └── ...
└── utils/
    └── layoutUtils.js (레이아웃 유틸)
```

## 컴포넌트 및 인터페이스

### 1. 관리자 메인 페이지 (Admin MainBoard)

**현재 문제**: 전체 레이아웃 붕괴

**개선 사항**:
- 학생 메인 페이지의 레이아웃을 그대로 재사용
- 기능만 관리자 기준으로 동작하도록 수정
- 캘린더, 일정표, 공지사항 등의 요소 정상 배치

**구현 방식**:
```javascript
// 학생 메인 페이지 컴포넌트를 기반으로 함
// 기능 로직만 관리자 기준으로 변경
const AdminMainBoard = () => {
  // 학생 MainBoard와 동일한 레이아웃
  // 데이터 로드 및 필터링은 관리자 기준
}
```

### 2. 커뮤니티 페이지 (Community)

**현재 문제**: 상단에 불필요한 안내 박스 표시

**개선 사항**:
- 클래스 이름 안내 박스 제거
- 글 목록이 상단에 바로 표시되도록 수정

**제거 대상**:
```html
<!-- 제거할 요소 -->
<div class="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
  클래스 이름 안내
</div>
```

### 3. 클래스룸 Sidebar - 수정하기 버튼 개선

**현재 문제**: 기한 수정 불가, 저장 시 데이터 미반영

**개선 사항**:
- 수정 화면에서 제목, 내용, 기한 모두 수정 가능
- 저장 시 실제 데이터 반영
- 수정 완료 후 목록으로 돌아가기

**수정 폼 구조**:
```javascript
{
  title: string,
  content: string,
  dueDate: date,
  attachments: File[]
}
```

### 4. 클래스룸 Sidebar - 과제 현황 버튼 개선

**현재 문제**: 팝업 형태로 표시됨

**개선 사항**:
- 모달 형태로 변경
- 각 학생의 제출 상태 표시
- 스크롤바 색상을 초록색으로 설정
- 전체 인원 수 검증

**AssignmentStatusModal 구조**:
```javascript
{
  assignmentId: string,
  students: [
    {
      studentId: string,
      name: string,
      submitted: boolean,
      submittedDate: date
    }
  ],
  totalCount: number
}
```

### 5. 클래스룸 Sidebar - 버튼 레이아웃 개선

**현재 문제**: 수정하기와 과제 현황 버튼이 좌우로 배치됨

**개선 사항**:
- 버튼을 상하로 배치
- 버튼의 세로 길이 증가
- 버튼의 가로 길이 감소

**CSS 변경**:
```css
.button-container {
  display: flex;
  flex-direction: column; /* 상하 배치 */
  gap: 10px;
}

.button {
  width: 100%; /* 가로 길이 증가 */
  padding: 12px 8px; /* 세로 길이 증가 */
}
```

### 6. 클래스룸 Sidebar - Filter Section 버튼 위치 개선

**현재 문제**: + 버튼의 위치가 명확하지 않음

**개선 사항**:
- 동그란 + 버튼을 ALL 버튼의 왼쪽에 배치
- 버튼 형태를 동그란 원형으로 설정

**CSS 변경**:
```css
.filter-button {
  width: 40px;
  height: 40px;
  border-radius: 50%; /* 동그란 형태 */
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 7. 클래스룸 Sidebar - 라디오 버튼 UI 개선

**현재 문제**: 라디오 버튼이 작고 클릭 시 검은 테두리 표시

**개선 사항**:
- 인풋 크기 확대
- 클릭 시 검은 테두리 제거
- 깔끔한 UI로 표시

**CSS 변경**:
```css
.radio-label input[type="radio"] {
  width: 20px; /* 크기 확대 */
  height: 20px;
  cursor: pointer;
  outline: none; /* 테두리 제거 */
}

.radio-label input[type="radio"]:focus {
  outline: none; /* focus 시에도 테두리 제거 */
}
```

### 8. 관리자 클래스 목록 구성

**현재 문제**: 생성한 클래스만 표시됨

**개선 사항**:
- 생성한 클래스 표시
- 참여한 클래스 표시
- 모든 클래스를 class-grid에 포함

**데이터 로드 로직**:
```javascript
const classes = [
  ...createdClasses,  // 생성한 클래스
  ...participatedClasses  // 참여한 클래스
];
```

### 9. 클래스 생성 모달 (AdminClassModal) 단순화

**현재 문제**: 모달 구성이 복잡함

**개선 사항**:
- 클래스 이름 입력 필드
- 참여 코드 필드 (자동 생성)
- 취소/생성 버튼 (가로 배치)
- 명확한 배치 순서

**모달 구조**:
```
┌─────────────────────────┐
│ 클래스 생성              │
├─────────────────────────┤
│ 클래스 이름              │
│ [입력 필드]              │
├─────────────────────────┤
│ 참여 코드                │
│ [자동 생성 코드]         │
├─────────────────────────┤
│ [취소]  [생성]           │
└─────────────────────────┘
```

### 10. 마이페이지 - 불필요 요소 제거

**현재 문제**: class="admin-notice" 요소가 표시됨

**개선 사항**:
- admin-notice 요소 완전 제거
- 마이페이지 레이아웃 정리

### 11. 마이페이지 - 시간표 수정 버튼 UI 개선

**현재 문제**: 수정 버튼이 크고 사각형 형태

**개선 사항**:
- 동그란 버튼 형태로 변경
- 버튼 크기 축소

**CSS 변경**:
```css
.edit-button {
  width: 40px;
  height: 40px;
  border-radius: 50%; /* 동그란 형태 */
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 12. 마이페이지 - 시간표 수정 시 레이아웃 유지

**현재 문제**: 수정 버튼 클릭 시 컨테이너 크기 증가

**개선 사항**:
- 컨테이너 크기 고정
- 완료/취소 버튼을 수정 버튼 옆에 배치
- 레이아웃 변화 없음

**CSS 변경**:
```css
.timetable-container {
  width: 100%;
  height: auto;
  min-height: 300px; /* 최소 높이 설정 */
}

.button-group {
  display: flex;
  gap: 10px;
  align-items: center;
}
```

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

### AssignmentStatus 모델
```javascript
{
  assignmentId: string,
  students: [
    {
      studentId: string,
      name: string,
      submitted: boolean,
      submittedDate: timestamp
    }
  ],
  totalCount: number
}
```

### Class 모델
```javascript
{
  id: string,
  name: string,
  participationCode: string,
  createdBy: string,
  createdAt: timestamp,
  participants: string[]
}
```

## 정확성 속성 (Correctness Properties)

정확성 속성은 시스템이 만족해야 하는 형식적 명세입니다.

### Property 1: 관리자 메인 페이지 레이아웃

**설명**: 관리자 메인 페이지는 학생 메인 페이지와 동일한 레이아웃을 가져야 합니다.

*For any* 관리자 사용자와 메인 페이지, 캘린더, 일정표, 공지사항 등의 요소가 정상적으로 배치되어야 합니다.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: 커뮤니티 상단 안내 박스 제거

**설명**: 커뮤니티 페이지에서 상단의 클래스 이름 안내 박스가 표시되지 않아야 합니다.

*For any* 커뮤니티 페이지, 상단에 안내 박스가 렌더링되지 않아야 하고 글 목록이 바로 표시되어야 합니다.

**Validates: Requirements 2.1, 2.2**

### Property 3: 수정하기 버튼 기한 수정 가능

**설명**: 수정하기 버튼 클릭 시 기한을 포함한 모든 필드를 수정할 수 있어야 합니다.

*For any* 공지사항 또는 과제, 수정 화면에서 제목, 내용, 기한을 모두 수정할 수 있어야 합니다.

**Validates: Requirements 3.1, 3.2**

### Property 4: 수정 데이터 저장

**설명**: 수정 후 저장 시 변경된 데이터가 실제로 저장되어야 합니다.

*For any* 수정된 데이터, 저장 버튼 클릭 시 데이터가 실제로 저장되고 목록에 반영되어야 합니다.

**Validates: Requirements 3.3, 3.4**

### Property 5: 과제 현황 모달 표시

**설명**: 과제 현황 버튼 클릭 시 모달이 표시되어야 합니다.

*For any* 과제 현황 버튼 클릭 이벤트, AssignmentStatusModal이 활성화되고 각 학생의 제출 상태가 표시되어야 합니다.

**Validates: Requirements 4.1, 4.2**

### Property 6: 과제 현황 스크롤바 색상

**설명**: 과제 현황 모달의 스크롤바 색상이 초록색이어야 합니다.

*For any* 과제 현황 모달, 스크롤바의 색상이 초록색으로 표시되어야 합니다.

**Validates: Requirements 4.3**

### Property 7: 과제 현황 인원 수 검증

**설명**: 과제 현황의 전체 인원 수가 클래스 전체 인원 수와 일치해야 합니다.

*For any* 과제 현황 모달, 표시되는 전체 인원 수가 클래스의 실제 인원 수와 일치해야 합니다.

**Validates: Requirements 4.4**

### Property 8: 버튼 상하 배치

**설명**: 수정하기 버튼과 과제 현황 버튼이 상하로 배치되어야 합니다.

*For any* 클래스룸 Sidebar, 수정하기 버튼과 과제 현황 버튼이 상하로 배치되어야 합니다.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 9: Filter Section 버튼 위치

**설명**: + 버튼이 ALL 버튼의 왼쪽에 동그란 형태로 배치되어야 합니다.

*For any* 필터 섹션, + 버튼이 ALL 버튼의 왼쪽에 동그란 형태로 표시되어야 합니다.

**Validates: Requirements 6.1, 6.2**

### Property 10: 라디오 버튼 UI

**설명**: 라디오 버튼이 확대되고 클릭 시 검은 테두리가 표시되지 않아야 합니다.

*For any* 라디오 버튼, 인풋 크기가 확대되고 클릭 시 검은 테두리가 표시되지 않아야 합니다.

**Validates: Requirements 7.1, 7.2, 7.3**

### Property 11: 관리자 클래스 목록 구성

**설명**: 클래스 목록에 생성한 클래스와 참여한 클래스가 모두 포함되어야 합니다.

*For any* 관리자 사용자, 클래스 목록에 생성한 클래스와 참여한 클래스가 모두 표시되어야 합니다.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 12: 클래스 생성 모달 구성

**설명**: 클래스 생성 모달이 클래스 이름, 참여 코드, 버튼 순서로 배치되어야 합니다.

*For any* 클래스 생성 모달, 클래스 이름, 참여 코드, 버튼 영역이 명확한 순서로 배치되어야 합니다.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

### Property 13: 마이페이지 admin-notice 제거

**설명**: 마이페이지에서 admin-notice 요소가 표시되지 않아야 합니다.

*For any* 관리자 마이페이지, class="admin-notice" 요소가 렌더링되지 않아야 합니다.

**Validates: Requirements 10.1**

### Property 14: 시간표 수정 버튼 UI

**설명**: 시간표 수정 버튼이 동그란 형태로 축소되어야 합니다.

*For any* 마이페이지 시간표, 수정 버튼이 동그란 형태로 축소되어 표시되어야 합니다.

**Validates: Requirements 11.1, 11.2**

### Property 15: 시간표 수정 시 레이아웃 유지

**설명**: 시간표 수정 시 컨테이너 크기가 고정되고 완료/취소 버튼이 수정 버튼 옆에 배치되어야 합니다.

*For any* 시간표 수정 상태, 컨테이너 크기가 고정되고 완료/취소 버튼이 수정 버튼 옆에 배치되어야 합니다.

**Validates: Requirements 12.1, 12.2, 12.3**

## 오류 처리

### 관리자 메인 페이지
- 데이터 로드 실패: 기본 레이아웃 표시
- 기능 오류: 콘솔 에러 로깅

### 커뮤니티 페이지
- 글 목록 로드 실패: "글을 불러올 수 없습니다" 메시지 표시

### 클래스룸 Sidebar
- 수정 데이터 저장 실패: 에러 메시지 표시 및 재시도 옵션
- 과제 현황 데이터 로드 실패: "과제 현황을 불러올 수 없습니다" 메시지 표시

### 마이페이지
- 시간표 수정 실패: 에러 메시지 표시

## 테스트 전략

### 단위 테스트 (Unit Tests)

1. **관리자 메인 페이지**
   - 레이아웃 정상 표시 테스트
   - 기능 정상 동작 테스트

2. **커뮤니티 페이지**
   - 안내 박스 미노출 테스트
   - 글 목록 표시 테스트

3. **클래스룸 Sidebar**
   - 수정하기 버튼 기능 테스트
   - 과제 현황 모달 표시 테스트
   - 버튼 레이아웃 테스트
   - Filter Section 버튼 위치 테스트
   - 라디오 버튼 UI 테스트

4. **관리자 클래스 목록**
   - 생성한 클래스 표시 테스트
   - 참여한 클래스 표시 테스트

5. **클래스 생성 모달**
   - 모달 구성 테스트
   - 버튼 배치 테스트

6. **마이페이지**
   - admin-notice 제거 테스트
   - 시간표 수정 버튼 UI 테스트
   - 시간표 수정 시 레이아웃 유지 테스트

### 속성 기반 테스트 (Property-Based Tests)

1. **Property 1-15**: 모든 정확성 속성
   - 각 속성에 대한 자동화된 검증
   - 다양한 입력 데이터로 테스트
