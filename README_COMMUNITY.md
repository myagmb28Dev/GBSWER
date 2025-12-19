# 커뮤니티 게시판 구현 완료 ✅

## 📁 파일 구조

```
src/pages/Community/
├── CommunityBoard.jsx      # 메인 페이지 (날짜 표시, 레이아웃)
├── PostTable.jsx            # 게시물 테이블 (헤더 + 리스트)
├── EmptyState.jsx           # 빈 상태 UI
├── Pagination.jsx           # 페이지네이션
├── WritePostModal.jsx       # 글쓰기 모달 (팝업)
└── ReadPostModal.jsx        # 글 읽기 모달 (팝업)
```

## 🎯 구현된 기능

### 1. 게시물 작성
- 우측 하단 플로팅 버튼 (+ 아이콘)
- 클릭 시 WritePostModal 팝업
- 제목, 내용, 익명 여부, 파일 첨부 가능

### 2. 게시물 읽기
- 테이블 row 클릭 시 ReadPostModal 팝업
- 조회수 자동 증가
- 이미지 미리보기, 파일 다운로드 지원

### 3. 게시물 리스트
- 작성일, 제목, 작성자, 조회수 표시
- 첨부파일 아이콘 표시
- hover 시 배경색 변경

### 4. 빈 상태
- 게시물이 없을 때 "등록된 게시물이 존재하지 않습니다." 표시

### 5. 페이지네이션
- 페이지당 10개 게시물
- 최대 10개 페이지 버튼 표시
- 이전/다음 버튼

### 6. 반응형 디자인
- 모바일: 작은 폰트, 좁은 간격
- 태블릿: 중간 크기
- 데스크톱: 넓은 레이아웃

## 🚀 실행 방법

```bash
# 의존성 설치 (Tailwind CSS 포함)
npm install

# 개발 서버 실행
npm start
```

브라우저에서 http://localhost:3000 접속

## 🎨 디자인 특징

- **색상**: Teal (#14b8a6) 메인 컬러
- **폰트**: 시스템 기본 폰트
- **애니메이션**: hover, transition 효과
- **그림자**: 부드러운 shadow-sm, shadow-lg

## 💡 사용 방법

1. **게시물 작성**: 우측 하단 + 버튼 클릭
2. **게시물 읽기**: 테이블에서 게시물 클릭
3. **페이지 이동**: 하단 페이지네이션 버튼 클릭

## 🔧 커스터마이징

### 색상 변경
`tailwind.config.js`에서 teal 색상 수정:

\`\`\`js
colors: {
  'teal': {
    500: '#14b8a6', // 원하는 색상으로 변경
  }
}
\`\`\`

### 페이지당 게시물 수 변경
`CommunityBoard.jsx`에서:

\`\`\`js
const postsPerPage = 10; // 원하는 숫자로 변경
\`\`\`

### 날짜 형식 변경
`CommunityBoard.jsx`의 `handleWritePost` 함수에서:

\`\`\`js
date: \`\${now.getFullYear()}.\${String(now.getMonth() + 1).padStart(2, '0')}.\${String(now.getDate()).padStart(2, '0')}\`
\`\`\`

## 📝 추가 기능 제안

더 많은 기능 제안은 `COMMUNITY_FEATURES.md` 참고!
