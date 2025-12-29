import React, { useState } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import AssignmentStatusModal from '../AssignmentStatusModal/AssignmentStatusModal';
import SubmissionReviewModal from '../SubmissionReviewModal/SubmissionReviewModal';
import './ClassDetailSidebar.css';

const AdminClassDetailSidebar = ({
  selectedPost = null,
  onClose,
  classId,
  onPostCreate,
  onPostUpdate,
  onPostDelete
}) => {
  const [isAssignmentStatusOpen, setIsAssignmentStatusOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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
    setIsEditMode(true);
  };

  const handleEditSave = () => {
    // 수정 로직
    console.log('수정 저장:', { title: editTitle, content: editContent });
    setIsEditMode(false);
  };

  const fetchSubmissions = async () => {
    if (!selectedPost || selectedPost.type !== '과제' || !classId) return;

    try {
      setLoadingSubmissions(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/api/classes/${classId}/posts/${selectedPost.id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubmissions(response.data?.data?.submissions || []);
    } catch (error) {
      console.error('제출 현황 조회 실패:', error);
      // API가 없으면 하드코딩된 데이터 사용
      setSubmissions([
        { id: 1, studentId: 1, studentName: "김민수", studentNumber: "2024001", submitted: true, submittedAt: "2024-12-25T10:00:00", attachments: [] },
        { id: 2, studentId: 2, studentName: "이지은", studentNumber: "2024002", submitted: false, submittedAt: null, attachments: [] },
        { id: 3, studentId: 3, studentName: "박준호", studentNumber: "2024003", submitted: true, submittedAt: "2024-12-24T15:30:00", attachments: [] }
      ]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleViewSubmissions = () => {
    fetchSubmissions();
    setIsAssignmentStatusOpen(true);
  };

  const handleReviewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async (reviewData) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`/api/classes/${classId}/posts/${selectedPost.id}/submissions/${selectedSubmission.id}/review`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('평가가 저장되었습니다.');
      setIsReviewModalOpen(false);
      setSelectedSubmission(null);
      // 제출 현황 새로고침
      fetchSubmissions();
    } catch (error) {
      console.error('평가 저장 실패:', error);
      alert('평가 저장에 실패했습니다.');
    }
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
                    rows="6"
                  />
                </div>
                <div className="edit-actions">
                  <button 
                    onClick={() => setIsEditMode(false)}
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
                    {selectedPost.content || '과제 내용이 아직 준비되지 않았습니다.'}
                  </p>
                </div>

                {/* 캐릭터와 버튼들 */}
                <div className="character-section">
                  <img src="/meister-game.png" alt="마이스터 캐릭터" className="sidebar-character" />
                  <div className="button-section">
                    <button
                      onClick={handleEditStart}
                      className="edit-button"
                    >
                      수정하기
                    </button>
                    <button
                      onClick={handleViewSubmissions}
                      className="status-button"
                    >
                      제출 현황
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('게시물을 삭제하시겠습니까?')) {
                          if (onPostDelete && classId) {
                            onPostDelete(selectedPost.id);
                            onClose();
                          }
                        }
                      }}
                      className="delete-button"
                    >
                      <Trash2 size={16} />
                      삭제하기
                    </button>
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
                    onClick={() => setIsEditMode(false)}
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
                    {selectedPost.content || '공지 내용이 아직 준비되지 않았습니다.'}
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
                    <button
                      onClick={() => {
                        if (window.confirm('게시물을 삭제하시겠습니까?')) {
                          if (onPostDelete && classId) {
                            onPostDelete(selectedPost.id);
                            onClose();
                          }
                        }
                      }}
                      className="delete-button"
                    >
                      <Trash2 size={16} />
                      삭제하기
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
            participants={submissions}
            loading={loadingSubmissions}
            onReviewSubmission={handleReviewSubmission}
          />
        )}

        {/* 제출물 평가 모달 */}
        {selectedSubmission && (
          <SubmissionReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => {
              setIsReviewModalOpen(false);
              setSelectedSubmission(null);
            }}
            submission={selectedSubmission}
            assignmentTitle={selectedPost.title}
            onSaveReview={handleSaveReview}
          />
        )}
      </div>
    </div>
  );
};

export default AdminClassDetailSidebar;
