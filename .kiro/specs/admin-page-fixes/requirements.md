# 관리자 페이지 수정 사항 요구사항

## 소개

관리자 페이지에 적용되는 기능 수정 사항입니다. 메인 페이지 레이아웃 오류 수정, 커뮤니티 상단 안내 박스 제거, 클래스룸 Sidebar 개선, 마이페이지 수정을 포함합니다.

## 용어 정의

- **System**: 프론트엔드 애플리케이션
- **Admin Page**: 관리자 역할의 사용자가 접근하는 페이지
- **Main Board**: 메인 페이지
- **ClassDetailSidebar**: 클래스 상세 정보를 표시하는 사이드바 컴포넌트
- **Assignment Status**: 과제 현황
- **Timetable**: 시간표
- **Edit Button**: 수정하기 버튼
- **Filter Section**: 필터 섹션

## 요구사항

### 요구사항 1: 관리자 메인 페이지 레이아웃 오류 수정

**사용자 스토리**: 관리자로서 메인 페이지에 접속했을 때 정상적인 레이아웃이 표시되기를 원합니다.

#### 수용 기준

1. WHEN 관리자가 메인 페이지에 접속 THEN THE System SHALL 학생 메인 페이지와 동일한 레이아웃을 표시하기
2. WHEN 관리자 메인 페이지가 표시됨 THEN THE System SHALL 캘린더, 일정표, 공지사항 등의 요소가 정상적으로 배치되기
3. WHEN 관리자 메인 페이지가 표시됨 THEN THE System SHALL 기능은 관리자 기준으로 동작하기

### 요구사항 2: 커뮤니티 상단 안내 박스 제거

**사용자 스토리**: 관리자로서 커뮤니티 페이지에서 불필요한 안내 박스가 제거되기를 원합니다.

#### 수용 기준

1. WHEN 관리자가 커뮤니티 페이지에 접속 THEN THE System SHALL 상단의 클래스 이름 안내 박스를 표시하지 않기
2. WHEN 커뮤니티 페이지가 표시됨 THEN THE System SHALL 글 목록이 상단에 바로 표시되기

### 요구사항 3: 클래스룸 Sidebar (관리자용) 수정하기 버튼 개선

**사용자 스토리**: 관리자로서 클래스룸 페이지에서 공지사항과 과제를 수정할 때, 기한도 함께 수정할 수 있기를 원합니다.

#### 수용 기준

1. WHEN 관리자가 수정하기 버튼을 클릭 THEN THE System SHALL 수정 화면을 표시하기
2. WHEN 수정 화면이 표시됨 THEN THE System SHALL 제목, 내용, 기한을 모두 수정할 수 있도록 하기
3. WHEN 관리자가 수정 후 저장 THEN THE System SHALL 변경된 데이터를 실제로 저장하기
4. WHEN 저장이 완료됨 THEN THE System SHALL 수정 화면을 닫고 목록으로 돌아가기

### 요구사항 4: 클래스룸 Sidebar (관리자용) 과제 현황 버튼 개선

**사용자 스토리**: 관리자로서 클래스룸 페이지에서 과제 현황을 확인할 때, 팝업이 아닌 모달 형태로 표시되기를 원합니다.

#### 수용 기준

1. WHEN 관리자가 과제 현황 버튼을 클릭 THEN THE System SHALL 과제 현황 모달을 표시하기
2. WHEN 과제 현황 모달이 표시됨 THEN THE System SHALL 각 학생의 제출 상태를 표시하기
3. WHEN 과제 현황 모달이 표시됨 THEN THE System SHALL 스크롤바 색상이 초록색이기
4. WHEN 과제 현황 모달이 표시됨 THEN THE System SHALL 전체 인원 수가 클래스 전체 인원 수와 일치하기

### 요구사항 5: 클래스룸 Sidebar (관리자용) 버튼 레이아웃 개선

**사용자 스토리**: 관리자로서 클래스룸 페이지의 수정하기 버튼과 과제 현황 버튼이 명확하게 구분되기를 원합니다.

#### 수용 기준

1. WHEN 클래스룸 Sidebar가 표시됨 THEN THE System SHALL 수정하기 버튼과 과제 현황 버튼을 상하로 배치하기
2. WHEN 버튼들이 표시됨 THEN THE System SHALL 버튼의 세로 길이가 증가하기
3. WHEN 버튼들이 표시됨 THEN THE System SHALL 버튼의 가로 길이가 감소하기

### 요구사항 6: 클래스룸 Sidebar (관리자용) Filter Section 버튼 위치 개선

**사용자 스토리**: 관리자로서 클래스룸 페이지의 필터 섹션에서 + 버튼이 명확하게 위치하기를 원합니다.

#### 수용 기준

1. WHEN 필터 섹션이 표시됨 THEN THE System SHALL 동그란 + 버튼을 ALL 버튼의 왼쪽에 배치하기
2. WHEN + 버튼이 표시됨 THEN THE System SHALL 버튼이 동그란 형태이기

### 요구사항 7: 클래스룸 Sidebar (관리자용) 라디오 버튼 UI 개선

**사용자 스토리**: 관리자로서 클래스룸 페이지의 라디오 버튼이 명확하고 깔끔하게 표시되기를 원합니다.

#### 수용 기준

1. WHEN 라디오 버튼이 표시됨 THEN THE System SHALL 인풋 크기가 확대되기
2. WHEN 라디오 버튼을 클릭 THEN THE System SHALL 검은 테두리가 표시되지 않기
3. WHEN 라디오 버튼이 표시됨 THEN THE System SHALL 깔끔한 UI로 표시되기

### 요구사항 8: 관리자 클래스 목록 구성

**사용자 스토리**: 관리자로서 클래스 목록에서 자신이 생성한 클래스와 참여한 클래스를 모두 확인하고 싶습니다.

#### 수용 기준

1. WHEN 관리자가 클래스 목록을 조회 THEN THE System SHALL 관리자가 생성한 클래스를 표시하기
2. WHEN 관리자가 클래스 목록을 조회 THEN THE System SHALL 관리자가 참여한 클래스를 표시하기
3. WHEN 클래스 목록이 표시됨 THEN THE System SHALL 모든 클래스가 class-grid에 포함되기

### 요구사항 9: 클래스 생성 모달 (admin-class-modal) 단순화

**사용자 스토리**: 관리자로서 클래스 생성 모달이 간단하고 명확하게 구성되기를 원합니다.

#### 수용 기준

1. WHEN 클래스 생성 모달이 표시됨 THEN THE System SHALL 클래스 이름 입력 필드를 표시하기
2. WHEN 클래스 생성 모달이 표시됨 THEN THE System SHALL 참여 코드 필드를 표시하기 (자동 생성)
3. WHEN 클래스 생성 모달이 표시됨 THEN THE System SHALL 취소 버튼과 생성 버튼을 가로로 배치하기
4. WHEN 클래스 생성 모달이 표시됨 THEN THE System SHALL 클래스 이름, 참여 코드, 버튼 영역 순서로 배치되기

### 요구사항 10: 마이페이지 불필요 요소 제거

**사용자 스토리**: 관리자로서 마이페이지에서 불필요한 요소가 제거되기를 원합니다.

#### 수용 기준

1. WHEN 관리자가 마이페이지에 접속 THEN THE System SHALL class="admin-notice" 요소를 표시하지 않기

### 요구사항 11: 마이페이지 시간표 수정 버튼 UI 개선

**사용자 스토리**: 관리자로서 마이페이지의 시간표 수정 버튼이 명확하고 작은 크기로 표시되기를 원합니다.

#### 수용 기준

1. WHEN 마이페이지 시간표가 표시됨 THEN THE System SHALL 수정 버튼이 동그란 형태이기
2. WHEN 수정 버튼이 표시됨 THEN THE System SHALL 버튼의 크기가 축소되기

### 요구사항 12: 마이페이지 시간표 수정 시 레이아웃 유지

**사용자 스토리**: 관리자로서 마이페이지의 시간표를 수정할 때 컨테이너 크기가 변하지 않기를 원합니다.

#### 수용 기준

1. WHEN 관리자가 수정 버튼을 클릭 THEN THE System SHALL 시간표 컨테이너 크기가 고정되기
2. WHEN 시간표가 수정 상태 THEN THE System SHALL 완료 버튼과 취소 버튼이 수정 버튼 옆에 배치되기
3. WHEN 시간표가 수정 상태 THEN THE System SHALL 레이아웃이 변하지 않기
