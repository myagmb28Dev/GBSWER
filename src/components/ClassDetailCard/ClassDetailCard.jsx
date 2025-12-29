import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Users, LogOut } from 'lucide-react';
import ClassParticipantsModal from '../ClassParticipantsModal/ClassParticipantsModal';
import './ClassDetailCard.css';

const ClassDetailCard = ({
  classData,
  onPostClick,
  onLeaveClass
}) => {
  // 실제 데이터 추출
  const className = classData?.className || "클래스명 없음";
  const teacherName = classData?.teacherName || "선생님 정보 없음";
  const classCode = classData?.classCode || "코드 없음";
  const participantCount = classData?.participantCount || 0;
  const participants = classData?.participants || [];
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const classId = classData?.id;

  // 게시물 목록 로드
  const loadPosts = useCallback(async () => {
    if (!classId) return;

    try {
      setLoadingPosts(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/api/classes/${classId}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(response.data?.data || []);
    } catch (error) {
      console.error('게시물 목록 로드 실패:', error);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [classId]);

  // 컴포넌트 마운트 시 및 classId 변경 시 게시물 목록 로드
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

  const filteredPosts = selectedFilter === 'ALL' 
    ? posts 
    : posts.filter(post => post.type === selectedFilter);

  // 날짜 표시 로직
  const getDisplayDate = (post) => {
    if (post.type === '공지') {
      // 공지는 작성일 표시 (createdAt 또는 date)
      if (post.createdAt) {
        const date = new Date(post.createdAt);
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
      }
      return post.date || '';
    } else if (post.type === '과제') {
      if (post.submitted) {
        return "제출 완료"; // 제출한 과제는 "제출 완료"
      } else if (post.dueDate || post.deadline) {
        // 제출하지 않은 과제는 D-day 계산
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const deadlineDate = new Date(post.dueDate || post.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        
        const timeDiff = deadlineDate.getTime() - today.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (dayDiff < 0) {
          return `${Math.abs(dayDiff)}일 지남`;
        } else if (dayDiff === 0) {
          return "D-Day";
        } else {
          return `D-${dayDiff}`;
        }
      }
      // deadline이 없으면 작성일
      if (post.createdAt) {
        const date = new Date(post.createdAt);
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
      }
      return post.date || '';
    }
    // 기본값
    if (post.createdAt) {
      const date = new Date(post.createdAt);
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
    return post.date || '';
  };

  return (
    <div className="class-detail-card">
      <div className="card-top-row">
        {/* 왼쪽: 제목과 선생님 이름 */}
        <div className="class-info-left">
          <h2 className="class-title">{className}</h2>
          <p className="teacher-name">{teacherName}</p>
        </div>
        
        {/* 오른쪽: 반 코드와 참가 인원을 세로로 배치 */}
        <div className="class-info-right">
          <div className="class-code-box">{classCode}</div>
          <div className="participant-controls">
            <div
              className="participant-info"
              onClick={(e) => {
                e.stopPropagation();
                setIsParticipantsModalOpen(true);
              }}
            >
              <Users size={14} className="participant-icon" />
              <span className="participant-count">{participantCount}</span>
            </div>
            <button
              className="leave-class-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onLeaveClass) {
                  onLeaveClass();
                }
              }}
              title="클래스 나가기"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="divider-line"></div>

      {/* 필터 섹션 */}
      <div className="filter-section">
        <h3 className="section-title">과제 및 공지사항</h3>
        <div className="filter-buttons">
          {['ALL', '과제', '공지'].map((filter) => (
            <button
              key={filter}
              className={`filter-button ${selectedFilter === filter ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFilter(filter);
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 게시물 목록 */}
      <div className="posts-list">
        {loadingPosts ? (
          <div className="loading-text">게시물 로딩 중...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-posts-text">게시물이 없습니다.</div>
        ) : (
          filteredPosts.map((post) => (
            <div 
              key={post.id} 
              className="post-item"
              onClick={() => onPostClick && onPostClick(post)}
            >
              <span className={`post-tag ${post.type === '과제' ? 'assignment' : 'notice'}`}>
                {post.type}
              </span>
              <span className="post-title">{post.title}</span>
              <span className="post-date">{getDisplayDate(post)}</span>
            </div>
          ))
        )}
      </div>

      {/* 참가자 모달 */}
      <ClassParticipantsModal
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        className={className}
        participants={participants}
      />
    </div>
  );
};

export default ClassDetailCard;