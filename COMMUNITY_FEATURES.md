# 커뮤니티 게시판 - 추가 기능 제안

## 🎯 현재 구현된 기능
- ✅ 게시물 리스트 테이블 (작성일, 제목, 작성자, 조회수)
- ✅ 게시물 없을 때 EmptyState 표시
- ✅ 페이지네이션 (1~10 페이지)
- ✅ 반응형 디자인 (모바일/태블릿/데스크톱)
- ✅ 게시물 클릭 시 조회수 증가
- ✅ 첨부파일 아이콘 표시

## 💡 추천 추가 기능

### 1. 검색 및 필터링
```jsx
// 제목, 작성자, 내용으로 검색
- 검색바 추가
- 작성자 필터
- 날짜 범위 필터
```

### 2. 정렬 기능
```jsx
// 테이블 헤더 클릭 시 정렬
- 최신순/오래된순
- 조회수 높은순/낮은순
- 제목 가나다순
```

### 3. 게시물 작성 버튼
```jsx
// 우측 하단 플로팅 버튼 또는 상단 버튼
<button 
  onClick={() => setShowWriteModal(true)}
  className="fixed bottom-8 right-8 bg-teal-500 text-white p-4 rounded-full shadow-lg hover:bg-teal-600"
>
  <Plus size={24} />
</button>
```

### 4. 게시물 카테고리
```jsx
// 공지사항, 자유게시판, Q&A 등
- 카테고리 탭 추가
- 카테고리별 필터링
```

### 5. 좋아요/댓글 수 표시
```jsx
// 게시물 리스트에 추가 정보
- 좋아요 수
- 댓글 수
- 신규 게시물 뱃지
```

### 6. 무한 스크롤
```jsx
// 페이지네이션 대신 무한 스크롤
- Intersection Observer API 사용
- 스크롤 시 자동 로딩
```

### 7. 게시물 고정 (Pin)
```jsx
// 중요 공지사항 상단 고정
- isPinned 속성 추가
- 고정 게시물은 항상 상단 표시
```

### 8. 다크모드
```jsx
// 테마 전환 기능
- 다크모드 토글 버튼
- localStorage에 테마 저장
```

### 9. 게시물 미리보기
```jsx
// 호버 시 툴팁으로 내용 미리보기
- 제목에 마우스 오버 시
- 첫 2-3줄 내용 표시
```

### 10. 로딩 스켈레톤
```jsx
// 데이터 로딩 중 스켈레톤 UI
- 테이블 row 스켈레톤
- 부드러운 로딩 경험
```

## 🚀 빠른 구현 예시

### 게시물 작성 버튼 추가
\`\`\`jsx
// CommunityBoard.jsx에 추가
import { Plus } from "lucide-react";

// return 문 안에 추가
<button 
  onClick={() => setShowWriteModal(true)}
  className="fixed bottom-8 right-8 bg-teal-500 text-white p-4 rounded-full shadow-lg hover:bg-teal-600 transition-all hover:scale-110 z-50"
  aria-label="게시물 작성"
>
  <Plus size={24} />
</button>
\`\`\`

### 검색 기능 추가
\`\`\`jsx
// SearchBar.jsx 새로 생성
import { Search } from "lucide-react";

const SearchBar = ({ onSearch }) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        placeholder="제목, 작성자로 검색..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
};
\`\`\`

### 정렬 기능 추가
\`\`\`jsx
// CommunityBoard.jsx에 추가
const [sortBy, setSortBy] = useState('date'); // 'date', 'views', 'title'
const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

const sortedPosts = [...posts].sort((a, b) => {
  if (sortBy === 'date') {
    return sortOrder === 'desc' 
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date);
  }
  if (sortBy === 'views') {
    return sortOrder === 'desc' ? b.views - a.views : a.views - b.views;
  }
  if (sortBy === 'title') {
    return sortOrder === 'desc' 
      ? b.title.localeCompare(a.title)
      : a.title.localeCompare(b.title);
  }
});
\`\`\`

## 📱 반응형 개선 사항
- 모바일에서는 작성일/조회수 숨기기 옵션
- 태블릿에서는 2단 레이아웃
- 스와이프 제스처로 게시물 삭제/수정

## 🎨 UI/UX 개선
- 로딩 애니메이션
- 에러 상태 처리
- 성공/실패 토스트 메시지
- 스켈레톤 로딩
- 부드러운 페이지 전환 애니메이션
