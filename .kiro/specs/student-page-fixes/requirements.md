# 학생 페이지 수정 사항 요구사항

## 소개

학생 페이지에 적용되는 기능 수정 사항입니다. 클래스룸 Sidebar의 수정 버튼 노출 오류 수정, 학생용 기능 정의, 참여자 정보 표시 기능을 포함합니다.

## 용어 정의

- **System**: 프론트엔드 애플리케이션
- **Student Page**: 학생 역할의 사용자가 접근하는 페이지
- **ClassDetailSidebar**: 클래스 상세 정보를 표시하는 사이드바 컴포넌트
- **Notice**: 공지사항
- **Assignment**: 과제
- **Edit Button**: 수정하기 버튼
- **Submit Button**: 제출하기 버튼
- **Participant Info**: 참여자 정보
- **Profile List**: 프로필 리스트

## 요구사항

### 요구사항 1: 클래스룸 Sidebar 수정 버튼 노출 오류 수정

**사용자 스토리**: 학생으로서 클래스룸 페이지에서 공지사항과 과제를 조회할 때, 수정하기 버튼이 노출되지 않기를 원합니다.

#### 수용 기준

1. WHEN 학생이 클래스룸 페이지에 접속 THEN THE System SHALL 공지사항 영역에 수정하기 버튼을 표시하지 않기
2. WHEN 학생이 클래스룸 페이지에 접속 THEN THE System SHALL 과제 영역에 수정하기 버튼을 표시하지 않기
3. WHEN 관리자가 클래스룸 페이지에 접속 THEN THE System SHALL 공지사항 영역에 수정하기 버튼을 표시하기
4. WHEN 관리자가 클래스룸 페이지에 접속 THEN THE System SHALL 과제 영역에 수정하기 버튼을 표시하기

### 요구사항 2: 클래스룸 Sidebar (학생용) 공지 영역 기능 정의

**사용자 스토리**: 학생으로서 클래스룸 페이지의 공지 영역에서 공지사항을 조회하고 싶습니다.

#### 수용 기준

1. WHEN 학생이 클래스룸 페이지에 접속 THEN THE System SHALL 공지 영역에 어떠한 버튼도 표시하지 않기
2. WHEN 학생이 공지사항을 조회 THEN THE System SHALL 공지사항의 제목, 내용, 작성일을 표시하기

### 요구사항 3: 클래스룸 Sidebar (학생용) 과제 영역 기능 정의

**사용자 스토리**: 학생으로서 클래스룸 페이지의 과제 영역에서 과제를 추가하고 제출할 수 있기를 원합니다.

#### 수용 기준

1. WHEN 학생이 클래스룸 페이지에 접속 THEN THE System SHALL 과제 영역에 과제 제출 버튼을 표시하기
2. WHEN 학생이 과제 제출 버튼을 클릭 THEN THE System SHALL 과제 제출 모달을 열기
3. WHEN 학생이 과제 제출 모달에서 파일을 선택하고 제출 THEN THE System SHALL 과제를 제출하기
4. WHEN 과제가 제출됨 THEN THE System SHALL "과제 제출이 완료되었습니다." 팝업을 표시하기
5. WHEN 과제가 제출됨 THEN THE System SHALL 수정하기 버튼을 표시하기
6. WHEN 학생이 수정하기 버튼을 클릭 THEN THE System SHALL 제출 파일을 수정할 수 있도록 하기
7. WHEN 학생이 + 버튼을 클릭 THEN THE System SHALL 과제를 추가하기

### 요구사항 4: 참여자 정보 표시

**사용자 스토리**: 학생으로서 클래스에 참여한 다른 학생들의 프로필 정보를 확인하고 싶습니다.

#### 수용 기준

1. WHEN 학생이 participant-info를 클릭 THEN THE System SHALL 해당 클래스에 참여한 학생들의 프로필 리스트를 표시하기
2. WHEN 프로필 리스트가 표시됨 THEN THE System SHALL 각 학생의 프로필 사진을 왼쪽에 표시하기
3. WHEN 프로필 리스트가 표시됨 THEN THE System SHALL 각 학생의 이름과 아이디를 오른쪽에 세로 정렬로 표시하기
4. WHEN 프로필 리스트가 표시됨 THEN THE System SHALL 모든 참여 학생의 정보를 포함하기
