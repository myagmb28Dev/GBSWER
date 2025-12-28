# 컴포넌트 사용 현황 맵

## 📍 공용 컴포넌트 (모든 페이지에서 사용)

### Header
- **위치**: `src/components/Header/Header.js`
- **사용처**: 모든 페이지 (Main, Community, Classroom, MyPage - 학생/관리자)
- **역할**: 네비게이션 헤더, 프로필 접근

### Footer
- **위치**: `src/components/Footer/Footer.js`
- **사용처**: 모든 페이지 (Main, Community, Classroom, MyPage - 학생/관리자)
- **역할**: 페이지 하단 푸터

### UserProfileModal
- **위치**: `src/components/UserProfileModal/`
- **포함 파일**: EditProfileModal.jsx, ChangePasswordModal.jsx, PasswordConfirmModal.jsx
- **사용처**: 전역 (Header에서 프로필 클릭 시)
- **역할**: 사용자 프로필 수정, 비밀번호 변경

---

## 📍 Main 페이지 컴포넌트

### 공용 (학생/관리자 동일)
**위치**: `src/components/Main/Shared/`

#### Calendar
- **파일**: Calendar.jsx, Calendar.css
- **포함 모달**: AddEventModal, ViewEventModal, DayDetailModal
- **사용처**: Main 페이지 (학생/관리자)
- **역할**: 월간 캘린더 표시, 일정 관리

#### WeeklySchedule
- **파일**: WeeklySchedule.jsx, WeeklySchedule.css
- **사용처**: Main 페이지 (학생/관리자)
- **역할**: 이번주 학사 일정 표시

#### NoticeCard
- **파일**: NoticeCard.jsx, NoticeCard.css
- **사용처**: Main 페이지 (학생/관리자)
- **역할**: 오늘의 공지사항 표시

### 관리자 전용
#### ClassCreateButton
- **파일**: `src/components/ClassCreateButton/ClassCreateButton.jsx`
- **사용처**: Main 페이지 (관리자만)
- **역할**: 클래스 생성 버튼

---

## 📍 Community 페이지 컴포넌트

### 공용 (학생/관리자 동일)
**위치**: `src/components/Community/Shared/`

#### CommunityPostTable
- **파일**: CommunityPostTable.jsx
- **사용처**: Community 페이지 (학생/관리자)
- **역할**: 게시물 목록 테이블 표시

#### CommunityPagination
- **파일**: CommunityPagination.jsx
- **사용처**: Community 페이지 (학생/관리자)
- **역할**: 페이지네이션 컨트롤

#### CommunityReadModal
- **파일**: CommunityReadModal.jsx
- **사용처**: Community 페이지 (학생/관리자)
- **역할**: 게시물 상세 보기 모달

#### CommunityWriteModal
- **파일**: CommunityWriteModal.jsx
- **사용처**: Community 페이지 (학생/관리자)
- **역할**: 게시물 작성 모달

#### CommunityEmptyState
- **파일**: CommunityEmptyState.jsx
- **사용처**: Community 페이지 (학생/관리자)
- **역할**: 게시물 없을 때 빈 상태 표시

---

## 📍 Classroom 페이지 컴포넌트

### 공용 (학생/관리자 동일)

#### ClassCard
- **파일**: `src/components/ClassCard/ClassCard.jsx`
- **사용처**: Classroom 페이지 (학생/관리자)
- **역할**: 클래스 카드 표시

#### ClassDetailCard
- **파일**: `src/components/ClassDetailCard/ClassDetailCard.jsx`
- **사용처**: Classroom 페이지 (학생/관리자)
- **역할**: 클래스 상세 정보 및 과제/공지 목록

#### ClassParticipantsModal
- **파일**: `src/components/ClassParticipantsModal/ClassParticipantsModal.jsx`
- **사용처**: ClassDetailCard에서 참여자 보기
- **역할**: 클래스 참여자 목록 모달

#### ClassCreateButton
- **파일**: `src/components/ClassCreateButton/ClassCreateButton.jsx`
- **사용처**: Classroom 페이지 (학생/관리자)
- **역할**: 클래스 생성/참여 버튼

### 학생 전용

#### ClassDetailSidebar
- **파일**: `src/components/ClassDetailSidebar/ClassDetailSidebar.jsx`
- **사용처**: Classroom 페이지 (학생만)
- **역할**: 과제 제출 박스, 과제 상세 정보

#### StudentClassModal
- **파일**: `src/components/StudentClassModal/StudentClassModal.jsx`
- **사용처**: ClassCreateButton에서 (학생)
- **역할**: 클래스 참여 코드 입력 모달

### 관리자 전용

#### AdminClassModal
- **파일**: `src/components/AdminClassModal/AdminClassModal.jsx`
- **사용처**: ClassCreateButton에서 (관리자)
- **역할**: 클래스 생성 모달

---

## 📍 MyPage 페이지 컴포넌트

### 공용 (학생/관리자 동일)
**위치**: `src/components/MyPage/Shared/`

#### UserProfileCard
- **파일**: UserProfileCard.jsx, UserProfileCard.css
- **사용처**: MyPage 페이지 (학생/관리자)
- **역할**: 사용자 프로필 정보 표시

#### PersonalScheduleBox
- **파일**: PersonalScheduleBox.jsx, PersonalScheduleBox.css
- **사용처**: MyPage 페이지 (학생/관리자)
- **역할**: 개인 일정 및 학교 일정 표시

#### SchoolMealCard
- **파일**: SchoolMealCard.jsx, SchoolMealCard.css
- **사용처**: MyPage 페이지 (학생/관리자)
- **역할**: 오늘의 급식 정보 표시

### 공용 (학생/관리자 동일) - 기존 위치 유지

#### ClassTimetable
- **파일**: `src/components/ClassTimetable/ClassTimetable.jsx`
- **사용처**: MyPage 페이지 (학생/관리자)
- **역할**: 시간표 표시

---

## 📊 컴포넌트 사용 빈도 요약

### 1페이지에서만 사용
- **Main**: ClassCreateButton (관리자만)
- **Community**: CommunityPostTable, CommunityPagination, CommunityReadModal, CommunityWriteModal, CommunityEmptyState
- **Classroom**: ClassCard, ClassDetailCard, ClassParticipantsModal, ClassDetailSidebar (학생), StudentClassModal (학생), AdminClassModal (관리자)
- **MyPage**: UserProfileCard, PersonalScheduleBox, SchoolMealCard, ClassTimetable

### 2페이지 이상에서 사용
- **Header**: 모든 페이지
- **Footer**: 모든 페이지
- **UserProfileModal**: 전역 (Header)
- **Calendar**: Main 페이지
- **WeeklySchedule**: Main 페이지
- **NoticeCard**: Main 페이지
- **ClassCreateButton**: Main (관리자), Classroom (학생/관리자)

---

## 🎯 현재 구조 평가

✅ **잘 정렬된 부분**
- Main 페이지: `Main/Shared/` 에 모두 정렬
- Community 페이지: `Community/Shared/` 에 모두 정렬
- MyPage 페이지: `MyPage/Shared/` 에 모두 정렬
- Header, Footer: 전역 공용 컴포넌트로 관리

⏳ **아직 정렬 필요**
- Classroom 페이지: 기존 위치에서 관리 중
  - 공용 컴포넌트: ClassCard, ClassDetailCard, ClassParticipantsModal, ClassCreateButton
  - 학생 전용: ClassDetailSidebar, StudentClassModal
  - 관리자 전용: AdminClassModal

---

## 💡 권장사항

현재 구조가 매우 잘 정렬되어 있습니다. 추가 정렬이 필요하다면:

1. **Classroom 페이지 정렬** (선택사항)
   - `Classroom/Shared/` 에 공용 컴포넌트 이동
   - `Classroom/Student/` 에 학생 전용 컴포넌트 이동
   - `Classroom/Admin/` 에 관리자 전용 컴포넌트 이동

2. **현재 상태 유지** (권장)
   - 현재 구조가 명확하고 관리하기 쉬움
   - 필요시 나중에 정렬 가능
