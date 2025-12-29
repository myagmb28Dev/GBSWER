import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import ClassParticipantsModal from '../ClassParticipantsModal/ClassParticipantsModal';
import PostWriteModal from '../PostWriteModal/PostWriteModal';
import './ClassDetailCard.css';

const AdminClassDetailCard = ({ 
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
  const [isPostWriteModalOpen, setIsPostWriteModalOpen] = useState(false);
<<<<<<< HEAD
=======
  const [isTeacherEditOpen, setIsTeacherEditOpen] = useState(false);
  const [editTeacherName, setEditTeacherName] = useState(teacherName);
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
  const [postsList, setPostsList] = useState(posts);

  const filteredPosts = selectedFilter === 'ALL' 
    ? postsList 
    : postsList.filter(post => post.type === selectedFilter);

  // 날짜 표시 로직
  const getDisplayDate = (post) => {
    if (post.type === '공지') {
      return post.date;
    } else if (post.type === '과제') {
      if (post.submitted) {
        return "제출 완료";
      } else if (post.deadline) {
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
      return post.date;
    }
    return post.date;
  };

  return (
    <div className="class-detail-card">
      <div className="card-top-row">
        {/* 왼쪽: 제목과 선생님 이름 */}
        <div className="class-info-left">
          <h2 className="class-title">{className}</h2>
<<<<<<< HEAD
          <p className="teacher-name">{teacherName}</p>
=======
          <p 
            className="teacher-name" 
            onClick={() => setIsTeacherEditOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            {editTeacherName}
          </p>
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
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
<<<<<<< HEAD
        <div className="filter-header">
          <h3 className="section-title">과제 및 공지사항</h3>
=======
        <h3 className="section-title">과제 및 공지사항</h3>
        <div className="filter-controls">
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
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
          <button 
            className="write-button"
            onClick={() => setIsPostWriteModalOpen(true)}
            title="글 작성"
          >
            <Plus size={20} />
          </button>
        </div>
<<<<<<< HEAD
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
=======
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
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

      {/* 글 작성 모달 */}
      <PostWriteModal
        isOpen={isPostWriteModalOpen}
        onClose={() => setIsPostWriteModalOpen(false)}
        onSubmit={(newPost) => {
          setPostsList([newPost, ...postsList]);
          setIsPostWriteModalOpen(false);
        }}
        classId={className}
      />
<<<<<<< HEAD
=======

      {/* 선생님 수정 모달 */}
      {isTeacherEditOpen && (
        <div className="modal-overlay" onClick={() => setIsTeacherEditOpen(false)}>
          <div className="teacher-edit-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">선생님 수정</h3>
            <input
              type="text"
              value={editTeacherName}
              onChange={(e) => setEditTeacherName(e.target.value)}
              className="teacher-input"
              placeholder="선생님 이름을 입력하세요"
            />
            <div className="modal-buttons">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setEditTeacherName(teacherName);
                  setIsTeacherEditOpen(false);
                }}
              >
                취소
              </button>
              <button 
                className="btn-confirm"
                onClick={() => {
                  setIsTeacherEditOpen(false);
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
    </div>
  );
};

export default AdminClassDetailCard;
