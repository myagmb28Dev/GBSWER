# 공용 페이지 수정 사항 요구사항

## 소개

학생 페이지와 관리자 페이지 모두에 적용되는 공용 기능 수정 사항입니다. 메인 페이지의 캘린더 기능, 일정표 체크박스 동작, 정보 수정 모달 UI, 프로필 UI 개선 등을 포함합니다.

## 용어 정의

- **System**: 프론트엔드 애플리케이션
- **Calendar**: 메인 페이지의 캘린더 컴포넌트
- **Schedule**: 일정 정보
- **Schedule Detail Modal**: 일정 상세 정보를 표시하는 모달
- **Weekly Schedule**: 주간 일정표 컴포넌트
- **Checkbox**: 일정표 상단의 추가 체크박스
- **User Profile Modal**: 사용자 정보 수정 모달
- **Profile UI**: 프로필 클릭 시 노출되는 UI

## 요구사항

### 요구사항 1: 메인 페이지 캘린더 → 일정 상세 모달 동작 오류 수정

**사용자 스토리**: 사용자로서 메인 페이지 캘린더에서 특정 날짜의 일정을 클릭하면, 해당 일정의 상세 정보를 모달로 확인하고 싶습니다.

#### 수용 기준

1. WHEN 메인 페이지 캘린더에서 날짜를 클릭 THEN THE System SHALL 해당 날짜의 일정 목록을 표시
2. WHEN 일정 목록에서 특정 일정을 클릭 THEN THE System SHALL 해당 일정의 상세 정보 모달을 열기
3. WHEN 일정 상세 모달이 열림 THEN THE System SHALL 일정의 제목, 시간, 설명 등 모든 정보를 표시
4. WHEN 모달의 닫기 버튼을 클릭 THEN THE System SHALL 모달을 닫고 캘린더로 돌아가기

### 요구사항 2: 일정표 체크박스 동작 검증

**사용자 스토리**: 사용자로서 일정표 상단의 체크박스를 통해 추가 일정의 표시 여부를 제어하고 싶습니다.

#### 수용 기준

1. WHEN 일정표 상단의 추가 체크박스가 체크되지 않음 THEN THE System SHALL 추가 일정을 표시하지 않기
2. WHEN 일정표 상단의 추가 체크박스가 체크됨 THEN THE System SHALL 추가 일정을 표시하기
3. WHEN 체크박스 상태가 변경됨 THEN THE System SHALL 일정표를 즉시 업데이트하기
4. WHEN 페이지가 새로고침됨 THEN THE System SHALL 체크박스의 이전 상태를 유지하기

### 요구사항 3: 정보 수정 모달 버튼 위치 변경

**사용자 스토리**: 사용자로서 정보 수정 모달에서 로그아웃 버튼의 위치가 명확하고 일관성 있게 배치되기를 원합니다.

#### 수용 기준

1. WHEN 정보 수정 모달이 열림 THEN THE System SHALL 로그아웃 버튼을 비밀번호 수정하기 버튼의 왼쪽에 배치
2. WHEN 모달이 표시됨 THEN THE System SHALL 버튼들이 명확한 시각적 계층 구조를 가지기
3. WHEN 사용자가 로그아웃 버튼을 클릭 THEN THE System SHALL 사용자를 로그아웃 처리하기

### 요구사항 4: 프로필 클릭 시 노출 UI 개선

**사용자 스토리**: 사용자로서 프로필을 클릭했을 때 프로필 정보와 관련 버튼들이 하나의 통합된 박스 UI로 표시되기를 원합니다.

#### 수용 기준

1. WHEN 프로필 아이콘을 클릭 THEN THE System SHALL 프로필 정보 박스를 표시하기
2. WHEN 프로필 정보 박스가 표시됨 THEN THE System SHALL 프로필 사진, 이름, 아이디를 포함하기
3. WHEN 프로필 정보 박스가 표시됨 THEN THE System SHALL 로그아웃 버튼과 정보 수정하기 버튼을 포함하기
4. WHEN 프로필 정보 박스가 표시됨 THEN THE System SHALL 모든 요소가 하나의 통합된 박스 UI로 구성되기
5. WHEN 박스 외부를 클릭 THEN THE System SHALL 프로필 정보 박스를 닫기

### 요구사항 5: 커뮤니티 페이지 권한 및 구조 전면 재설계

**사용자 스토리**: 사용자로서 커뮤니티 페이지에서 명확한 권한 정책에 따라 글을 작성, 조회, 수정, 삭제할 수 있고, 댓글을 작성하고 조회할 수 있기를 원합니다.

#### 수용 기준

##### 5-1. 권한 정책

1. WHEN 글쓴이가 자신의 글을 조회 THEN THE System SHALL 조회, 댓글, 수정, 삭제 기능을 모두 제공하기
2. WHEN 관리자가 타인의 글을 조회 THEN THE System SHALL 조회, 댓글, 삭제 기능을 제공하기 (수정 불가)
3. WHEN 일반 사용자가 타인의 글을 조회 THEN THE System SHALL 조회, 댓글 기능만 제공하기
4. WHEN 일반 사용자가 타인의 글을 조회 THEN THE System SHALL 파일 다운로드 및 미리보기 기능을 제공하기
5. WHEN 관계자가 글을 조회 THEN THE System SHALL 조회, 댓글, 삭제 기능을 제공하기

##### 5-2. 페이지 구조

1. WHEN 사용자가 커뮤니티 페이지에 접속 THEN THE System SHALL 글 목록 페이지를 표시하기
2. WHEN 사용자가 글 작성 버튼을 클릭 THEN THE System SHALL 글 작성 페이지로 이동하기
3. WHEN 사용자가 글 목록에서 글을 클릭 THEN THE System SHALL 글 조회 페이지로 이동하기
4. WHEN 글쓴이가 자신의 글에서 수정 버튼을 클릭 THEN THE System SHALL 글 수정 페이지로 이동하기
5. WHEN 글 조회 페이지가 표시됨 THEN THE System SHALL 댓글 작성 및 조회 기능을 포함하기

##### 5-3. 기타 기능

1. WHEN 글이 조회됨 THEN THE System SHALL 조회수를 증가시키기
2. WHEN 글 목록이 표시됨 THEN THE System SHALL 각 글의 조회수를 정확하게 표시하기
3. WHEN 커뮤니티 기능이 동작 THEN THE System SHALL 모든 오류를 제거하고 안정적으로 동작하기
