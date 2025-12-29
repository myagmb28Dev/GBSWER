import React, { useState } from 'react';
import { X } from 'lucide-react';
import AssignmentStatusModal from '../AssignmentStatusModal/AssignmentStatusModal';
import './ClassDetailSidebar.css';

const AdminClassDetailSidebar = ({ 
  selectedPost = null,
  onClose
}) => {
  const [isAssignmentStatusOpen, setIsAssignmentStatusOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
<<<<<<< HEAD
=======
  const [editDeadline, setEditDeadline] = useState('');
  const [editSubmissionType, setEditSubmissionType] = useState('deadline');

  // selectedPost가 변경되면 수정 모드 해제
  React.useEffect(() => {
    setIsEditMode(false);
  }, [selectedPost]);
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)

  if (!selectedPost) {
    return (
      <div className="class-detail-sidebar">
        <div className="sidebar-empty">
          <img src="/friends.png" alt="친구들 캐릭터" className="empty-character" />
          <p>과제와 공지를 확인해 보세요!</p>
        </div>
      </div>
    );
  }

  const handleEditStart = () => {
    setEditTitle(selectedPost.title);
    setEditContent(selectedPost.content || '');
<<<<<<< HEAD
=======
    setEditDeadline(selectedPost.deadline || '');
    setEditSubmissionType(selectedPost.submissionType || 'deadline');
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
    setIsEditMode(true);
  };

  const handleEditSave = () => {
    // 수정 로직
<<<<<<< HEAD
    console.log('수정 저장:', { title: editTitle, content: editContent });
=======
    console.log('수정 저장:', { title: editTitle, content: editContent, deadline: editDeadline, submissionType: editSubmissionType });
    setIsEditMode(false);
  };

  const handleEditCancel = () => {
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
    setIsEditMode(false);
  };

  return (
    <div className="class-detail-sidebar">
      <div className="sidebar-header">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      
      <div className="sidebar-content">
        {selectedPost.type === '과제' ? (
          // 과제용 레이아웃
          <>
            {isEditMode ? (
              // 수정 모드
              <div className="edit-form">
                <div className="form-group">
                  <label>제목</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label>내용</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="textarea-field"
<<<<<<< HEAD
                    rows="6"
                  />
                </div>
                <div className="edit-actions">
                  <button 
                    onClick={() => setIsEditMode(false)}
=======
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>수용 범위</label>
                  <select
                    value={editSubmissionType}
                    onChange={(e) => setEditSubmissionType(e.target.value)}
                    className="input-field"
                  >
                    <option value="deadline">기한</option>
                    <option value="unlimited">무제한</option>
                  </select>
                </div>
                {editSubmissionType === 'deadline' && (
                  <div className="form-group">
                    <label>기한</label>
                    <input
                      type="date"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      className="input-field"
                    />
                  </div>
                )}
                <div className="edit-actions">
                  <button 
                    onClick={handleEditCancel}
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
                    className="btn-cancel"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleEditSave}
                    className="btn-save"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              // 보기 모드
              <>
                <div className="post-header">
                  <h3 className="post-title">{selectedPost.title}</h3>
                  
                  <div className="assignment-period">
                    <p className="period-text">과제 기간: {selectedPost.deadline}</p>
                  </div>
                  
                  <p className="post-content">
                    {selectedPost.content || '과제 내용이 없습니다.'}
                  </p>
                </div>

                {/* 캐릭터와 버튼들 */}
                <div className="character-section">
                  <img src="/meister-game.png" alt="마이스터 캐릭터" className="sidebar-character" />
                  <div className="button-section">
                    <button 
<<<<<<< HEAD
                      onClick={handleEditStart} 
                      className="edit-button"
                    >
                      수정하기
                    </button>
                    <button 
=======
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
                      onClick={() => setIsAssignmentStatusOpen(true)}
                      className="status-button"
                    >
                      과제 현황
                    </button>
<<<<<<< HEAD
=======
                    <button 
                      onClick={handleEditStart} 
                      className="edit-button"
                    >
                      수정하기
                    </button>
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          // 공지용 레이아웃
          <>
            {isEditMode ? (
              // 수정 모드
              <div className="edit-form">
                <div className="form-group">
                  <label>제목</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label>내용</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="textarea-field"
                    rows="6"
                  />
                </div>
                <div className="edit-actions">
                  <button 
<<<<<<< HEAD
                    onClick={() => setIsEditMode(false)}
=======
                    onClick={handleEditCancel}
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
                    className="btn-cancel"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleEditSave}
                    className="btn-save"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              // 보기 모드
              <>
                <div className="post-header">
                  <h3 className="post-title">{selectedPost.title}</h3>
                  <p className="post-content">
                    {selectedPost.content || '공지 내용이 없습니다.'}
                  </p>
                </div>

                {/* 캐릭터 */}
                <div className="character-section">
                  <img src="/meister-game.png" alt="마이스터 캐릭터" className="sidebar-character" />
                  <div className="button-section">
                    <button 
                      onClick={handleEditStart} 
                      className="edit-button"
                    >
                      수정하기
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* 과제 현황 모달 */}
        {selectedPost?.type === '과제' && (
          <AssignmentStatusModal
            isOpen={isAssignmentStatusOpen}
            onClose={() => setIsAssignmentStatusOpen(false)}
            assignmentTitle={selectedPost.title}
            participants={[
              { id: 1, name: "김민수", studentId: "2024001", profileImage: "/profile.png", submitted: true },
              { id: 2, name: "이지은", studentId: "2024002", profileImage: "/profile.png", submitted: false },
              { id: 3, name: "박준호", studentId: "2024003", profileImage: "/profile.png", submitted: true },
              { id: 4, name: "최서연", studentId: "2024004", profileImage: "/profile.png", submitted: false },
              { id: 5, name: "정우진", studentId: "2024005", profileImage: "/profile.png", submitted: true },
              { id: 6, name: "한소영", studentId: "2024006", profileImage: "/profile.png", submitted: true },
              { id: 7, name: "윤태현", studentId: "2024007", profileImage: "/profile.png", submitted: false },
              { id: 8, name: "강민지", studentId: "2024008", profileImage: "/profile.png", submitted: true },
              { id: 9, name: "조현우", studentId: "2024009", profileImage: "/profile.png", submitted: false },
              { id: 10, name: "신예린", studentId: "2024010", profileImage: "/profile.png", submitted: true },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default AdminClassDetailSidebar;
