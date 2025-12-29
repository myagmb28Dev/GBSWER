# 학생 페이지 수정 사항 구현 계획

## 개요

학생 페이지에 적용되는 기능 수정 사항을 단계적으로 구현합니다. 클래스룸 Sidebar의 역할별 기능 분리, 과제 제출 기능 개선, 참여자 정보 표시 기능을 포함합니다.

## 구현 작업

### 1단계: ClassDetailSidebar 역할별 기능 분리

- [ ] 1.1 ClassDetailSidebar 컴포넌트 분석
  - ClassDetailSidebar.jsx 파일 검토
  - 현재 구조 및 렌더링 로직 분석
  - 역할 정보 전달 방식 확인
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 1.2 역할 검증 유틸 함수 작성
  - src/utils/roleUtils.js 생성
  - 사용자 역할 확인 함수 구현
  - 권한 검증 함수 구현
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 1.3 StudentNoticeSection 컴포넌트 생성
  - StudentNoticeSection.jsx 생성
  - 공지사항 목록 표시 로직 구현
  - 읽기 전용 UI 구현 (버튼 없음)
  - _Requirements: 2.1, 2.2_

- [ ] 1.4 AdminNoticeSection 컴포넌트 생성
  - AdminNoticeSection.jsx 생성
  - 공지사항 목록 표시 로직 구현
  - 수정하기 버튼 포함
  - _Requirements: 1.3_

- [ ] 1.5 ClassDetailSidebar에 조건부 렌더링 로직 추가
  - 사용자 역할에 따른 섹션 선택
  - StudentNoticeSection 또는 AdminNoticeSection 렌더링
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]* 1.6 ClassDetailSidebar 역할별 렌더링 단위 테스트 작성
  - **Property 1: 학생 페이지 수정 버튼 미노출**
  - **Property 2: 관리자 페이지 수정 버튼 노출**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [ ] 1.7 Checkpoint - ClassDetailSidebar 역할별 기능 분리 확인
  - 학생 페이지에서 수정 버튼 미노출 확인
  - 관리자 페이지에서 수정 버튼 노출 확인

### 2단계: 학생용 과제 영역 기능 구현

- [ ] 2.1 StudentAssignmentSection 컴포넌트 생성
  - StudentAssignmentSection.jsx 생성
  - 과제 목록 표시 로직 구현
  - 과제 제출 버튼 추가
  - + 버튼 추가
  - _Requirements: 3.1, 3.7_

- [ ] 2.2 과제 제출 상태 관리
  - useState를 사용한 과제 제출 상태 관리
  - 제출 완료 상태 추적
  - 수정하기 버튼 활성화 로직
  - _Requirements: 3.3, 3.5_

- [ ] 2.3 AssignmentSubmitModal 컴포넌트 생성
  - AssignmentSubmitModal.jsx 생성
  - 파일 선택 입력 필드 구현
  - 제출 버튼 구현
  - 취소 버튼 구현
  - _Requirements: 3.2_

- [ ] 2.4 과제 제출 완료 팝업 구현
  - 제출 성공 시 팝업 표시
  - "과제 제출이 완료되었습니다." 메시지 표시
  - 팝업 닫기 기능
  - _Requirements: 3.4_

- [ ] 2.5 제출 파일 수정 기능 구현
  - 제출 완료 후 수정하기 버튼 활성화
  - 수정하기 버튼 클릭 시 파일 수정 모달 열기
  - 파일 수정 및 저장 기능
  - _Requirements: 3.5_

- [ ] 2.6 과제 추가 기능 구현
  - + 버튼 클릭 시 과제 추가 모달 열기
  - 과제 추가 폼 구현
  - 과제 추가 완료 기능
  - _Requirements: 3.7_

- [ ]* 2.7 과제 제출 기능 단위 테스트 작성
  - **Property 4: 과제 제출 버튼 노출**
  - **Property 5: 과제 제출 모달 동작**
  - **Property 6: 과제 제출 완료 팝업**
  - **Property 7: 제출 파일 수정 기능**
  - **Property 8: 과제 추가 기능**
  - **Validates: Requirements 3.1, 3.2, 3.4, 3.5, 3.7**

- [ ] 2.8 Checkpoint - 학생용 과제 영역 기능 확인
  - 과제 제출 버튼 노출 확인
  - 과제 제출 모달 열기 확인
  - 제출 완료 팝업 표시 확인
  - 수정하기 버튼 활성화 확인
  - 과제 추가 기능 확인

### 3단계: 참여자 정보 표시 기능 구현

- [ ] 3.1 ParticipantListModal 컴포넌트 생성
  - ParticipantListModal.jsx 생성
  - 참여자 목록 표시 로직 구현
  - 모달 열기/닫기 기능
  - _Requirements: 4.1, 4.4_

- [ ] 3.2 ParticipantCard 컴포넌트 생성
  - ParticipantCard.jsx 생성
  - 프로필 사진 표시 (왼쪽)
  - 이름 표시 (오른쪽 위)
  - 아이디 표시 (오른쪽 아래)
  - _Requirements: 4.2, 4.3_

- [ ] 3.3 ParticipantListModal 스타일링
  - ParticipantListModal.css 작성
  - 참여자 카드 레이아웃 구현
  - 반응형 디자인 적용
  - _Requirements: 4.2, 4.3_

- [ ] 3.4 participant-info 클릭 이벤트 핸들러 추가
  - ClassDetailSidebar에 participant-info 요소 추가
  - 클릭 시 ParticipantListModal 활성화
  - 클래스 ID 전달
  - _Requirements: 4.1_

- [ ] 3.5 참여자 데이터 로드 로직 구현
  - API를 통한 참여자 데이터 로드
  - 데이터 로드 상태 관리
  - 에러 처리
  - _Requirements: 4.1, 4.4_

- [ ]* 3.6 참여자 정보 표시 단위 테스트 작성
  - **Property 9: 참여자 정보 리스트 표시**
  - **Property 10: 참여자 카드 UI 구성**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [ ] 3.7 Checkpoint - 참여자 정보 표시 기능 확인
  - participant-info 클릭 시 모달 열기 확인
  - 참여자 목록 표시 확인
  - 참여자 카드 UI 확인 (프로필, 이름, 아이디)

### 4단계: 최종 검증 및 통합

- [ ] 4.1 전체 기능 통합 테스트
  - 모든 수정 사항이 정상 동작하는지 확인
  - 기능 간 상호작용 검증
  - 성능 및 안정성 확인

- [ ] 4.2 최종 Checkpoint - 학생 페이지 수정 사항 완료
  - ClassDetailSidebar 역할별 기능 분리 확인
  - 학생용 과제 영역 기능 확인
  - 참여자 정보 표시 기능 확인

## 참고 사항

- 모든 작업은 기존 코드와의 호환성을 유지하면서 진행합니다.
- 각 단계별로 테스트를 작성하여 기능의 정확성을 검증합니다.
- 선택적 작업(*)은 MVP 완성 후 추가로 진행할 수 있습니다.
- 각 Checkpoint에서 사용자의 확인을 받고 다음 단계로 진행합니다.
