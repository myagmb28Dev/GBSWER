# 컴포넌트 페이지별 정렬 완료

## 완료된 작업

### 1. Main 페이지 컴포넌트 정렬 ✅
**위치:** `src/components/Main/Shared/`

모든 Main 페이지 컴포넌트들이 공용으로 정렬됨:
- `Calendar/` - 캘린더 및 모달 (AddEventModal, ViewEventModal, DayDetailModal)
- `WeeklySchedule/` - 주간 일정
- `NoticeCard/` - 공지사항

**페이지 업데이트:**
- `src/pages/Main/Student/MainBoard.jsx` - import 경로 업데이트
- `src/pages/Main/Admin/MainBoard.jsx` - import 경로 업데이트

---

### 2. Community 페이지 컴포넌트 정렬 ✅
**위치:** `src/components/Community/Shared/`

모든 Community 페이지 컴포넌트들이 공용으로 정렬됨:
- `CommunityPostTable/` - 게시물 테이블
- `CommunityPagination/` - 페이지네이션
- `CommunityReadModal/` - 게시물 읽기 모달
- `CommunityWriteModal/` - 게시물 작성 모달
- `CommunityEmptyState/` - 빈 상태 표시

**페이지 업데이트:**
- `src/pages/Community/Student/CommunityBoard.jsx` - import 경로 업데이트
- `src/pages/Community/Admin/CommunityBoard.jsx` - import 경로 업데이트

---

### 3. MyPage 페이지 컴포넌트 정렬 ✅
**위치:** `src/components/MyPage/Shared/`

ClassTimetable을 제외한 모든 MyPage 컴포넌트들이 공용으로 정렬됨:
- `UserProfileCard/` - 사용자 프로필 카드
- `PersonalScheduleBox/` - 개인 일정표
- `SchoolMealCard/` - 학교 급식 정보

**페이지 업데이트:**
- `src/pages/MyPage/Student/MyPageBoard.jsx` - import 경로 업데이트
- `src/pages/MyPage/Admin/MyPageBoard.jsx` - import 경로 업데이트

---

## 최종 컴포넌트 구조

```
src/components/
├── Shared/
│   ├── Header/
│   ├── Footer/
│   └── UserProfileModal/
│
├── Main/
│   └── Shared/
│       ├── Calendar/
│       │   ├── Calendar.jsx
│       │   ├── Calendar.css
│       │   ├── AddEventModal.jsx
│       │   ├── AddEventModal.css
│       │   ├── ViewEventModal.jsx
│       │   ├── ViewEventModal.css
│       │   ├── DayDetailModal.jsx
│       │   └── DayDetailModal.css
│       ├── WeeklySchedule/
│       │   ├── WeeklySchedule.jsx
│       │   └── WeeklySchedule.css
│       └── NoticeCard/
│           ├── NoticeCard.jsx
│           └── NoticeCard.css
│
├── Community/
│   └── Shared/
│       ├── CommunityPostTable/
│       │   └── CommunityPostTable.jsx
│       ├── CommunityPagination/
│       │   └── CommunityPagination.jsx
│       ├── CommunityReadModal/
│       │   └── CommunityReadModal.jsx
│       ├── CommunityWriteModal/
│       │   └── CommunityWriteModal.jsx
│       └── CommunityEmptyState/
│           └── CommunityEmptyState.jsx
│
├── MyPage/
│   └── Shared/
│       ├── UserProfileCard/
│       │   ├── UserProfileCard.jsx
│       │   └── UserProfileCard.css
│       ├── PersonalScheduleBox/
│       │   ├── PersonalScheduleBox.jsx
│       │   └── PersonalScheduleBox.css
│       └── SchoolMealCard/
│           ├── SchoolMealCard.jsx
│           └── SchoolMealCard.css
│
├── Classroom/
│   ├── Shared/
│   ├── Student/
│   └── Admin/
│
└── [기타 기존 컴포넌트들]
```

---

## 페이지별 컴포넌트 사용 현황

### Main 페이지 (학생/관리자 공용)
- Header (Shared)
- Footer (Shared)
- Calendar (Main/Shared)
- WeeklySchedule (Main/Shared)
- NoticeCard (Main/Shared)

### Community 페이지 (학생/관리자 공용)
- Header (Shared)
- Footer (Shared)
- CommunityPostTable (Community/Shared)
- CommunityPagination (Community/Shared)
- CommunityReadModal (Community/Shared)
- CommunityWriteModal (Community/Shared)
- CommunityEmptyState (Community/Shared)

### MyPage 페이지 (학생/관리자 공용)
- Header (Shared)
- Footer (Shared)
- UserProfileCard (MyPage/Shared)
- PersonalScheduleBox (MyPage/Shared)
- SchoolMealCard (MyPage/Shared)
- ClassTimetable (기존 위치 유지)

### Classroom 페이지 (학생/관리자 수정 필요)
- 아직 정렬 대기 중

---

## 다음 단계

### Classroom 페이지 컴포넌트 정렬 (예정)
- Classroom/Shared/ - 공용 컴포넌트
  - ClassCard
  - ClassDetailCard
  - ClassParticipantsModal
  - ClassCreateButton
- Classroom/Student/ - 학생용 컴포넌트
  - ClassDetailSidebar
  - StudentClassModal
- Classroom/Admin/ - 관리자용 컴포넌트
  - AdminClassDetailSidebar
  - AdminClassModal

---

## 주요 변경사항

✅ **import 경로 업데이트**
- Main 페이지: `../../../components/Main/Shared/...`
- Community 페이지: `../../../components/Community/Shared/...`
- MyPage 페이지: `../../../components/MyPage/Shared/...`

✅ **모든 CSS 파일 복사**
- 각 컴포넌트의 CSS 파일도 함께 이동

✅ **에러 없음**
- 모든 파일이 정상적으로 정렬되고 import 경로가 올바르게 업데이트됨

---

## 테스트 체크리스트

- [ ] Main 페이지 (학생) 정상 작동
- [ ] Main 페이지 (관리자) 정상 작동
- [ ] Community 페이지 (학생) 정상 작동
- [ ] Community 페이지 (관리자) 정상 작동
- [ ] MyPage 페이지 (학생) 정상 작동
- [ ] MyPage 페이지 (관리자) 정상 작동
- [ ] 캘린더 모달 정상 작동
- [ ] 게시물 작성/읽기 정상 작동
- [ ] 일정 추가/수정/삭제 정상 작동
