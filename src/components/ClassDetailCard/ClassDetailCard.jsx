import React, { useState } from 'react';
import { Users } from 'lucide-react';
import ClassParticipantsModal from '../ClassParticipantsModal/ClassParticipantsModal';
import './ClassDetailCard.css';

const ClassDetailCard = ({ 
  className = "빅데이터프로그래밍", 
  teacherName = "홍길동 선생님", 
  classCode = "ABC123",
  participantCount = 25,
  participants = [],
  posts = [],
  onPostClick
}) => {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

  const filteredPosts = selectedFilter === 'ALL' 
    ? posts 
    : posts.filter(post => post.type === selectedFilter);

  // 날짜 표시 로직
  const getDisplayDate = (post) => {
    if (post.type === '공지') {
      return post.date; // 공지는 항상 작성일
    } else if (post.type === '과제') {
      if (post.submitted) {
        return "제출 완료"; // 제출한 과제는 "제출 완료"
      } else if (post.deadline) {
        // 제출하지 않은 과제는 D-day 계산
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const deadlineDate = new Date(post.deadline);
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
      return post.date; // deadline이 없으면 작성일
    }
    return post.date;
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
        {filteredPosts.map((post) => (
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
        ))}
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