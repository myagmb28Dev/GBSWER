import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Trash2, File, X, Upload } from 'lucide-react';
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
  const [editDeadline, setEditDeadline] = useState('');
  const [editAttachments, setEditAttachments] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    if (!selectedPost || selectedPost.type !== '과제' || !classId) return;

    try {
      setLoadingSubmissions(true);
      const token = localStorage.getItem('accessToken');
      
      // 1. 클래스의 모든 참가자 목록 가져오기
      let allParticipants = [];
      try {
        const participantsResponse = await axios.get(`/api/classes/${classId}/participants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        allParticipants = participantsResponse.data?.data || [];
        console.log('👥 클래스 참가자 목록:', allParticipants);
      } catch (error) {
        console.warn('참가자 목록 조회 실패, 제출 현황만 사용:', error);
      }

      // 2. 제출 현황 가져오기
      const response = await axios.get(`/api/classes/${classId}/posts/${selectedPost.id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📋 제출 현황 API 응답:', response.data);
      
      // API 응답 구조에 따라 데이터 추출
      let submissionsData = response.data?.data?.submissions || response.data?.data || response.data || [];
      
      // 배열이 아닌 경우 배열로 변환
      if (!Array.isArray(submissionsData)) {
        submissionsData = [];
      }

      // 3. 제출 현황 데이터를 participants 형식으로 변환
      // 제출된 학생들의 ID를 Set으로 저장
      const submittedStudentIds = new Set();
      const submissionMap = new Map(); // studentId -> submission 매핑

      submissionsData.forEach(submission => {
        // 제출 현황에서 학생 ID 추출 (여러 가능한 필드명 확인)
        const studentId = submission.studentId || 
                         submission.student?.studentId || 
                         submission.user?.studentId || 
                         submission.student?.id ||
                         submission.user?.id ||
                         submission.id;
        if (studentId) {
          submittedStudentIds.add(String(studentId));
          submissionMap.set(String(studentId), submission);
        }
      });

      // 4. 모든 참가자 목록이 있으면 그것을 기반으로, 없으면 제출 현황만 사용
      let participantsData = [];
      
      if (allParticipants.length > 0) {
        // 모든 참가자 목록을 기반으로 제출 상태 매핑
        participantsData = allParticipants.map(participant => {
          const studentId = String(participant.studentId || participant.id || participant.userId || '');
          const isSubmitted = submittedStudentIds.has(studentId);
          const submission = submissionMap.get(studentId);
          
          // 학생 이름 필드 확인 (studentName, name 등 여러 가능한 필드명)
          const studentName = participant.studentName || participant.name || participant.userName || '';
          
          // 평가 상태 확인 (여러 가능한 필드명 확인)
          const reviewStatus = submission?.status || 
                              submission?.reviewStatus || 
                              submission?.review?.status ||
                              null;
          // 평가 완료는 APPROVED 또는 REVIEWED 상태만 (PENDING은 보류 상태이므로 평가 완료 아님)
          const isReviewed = reviewStatus === 'APPROVED' || 
                           reviewStatus === 'REVIEWED' ||
                           submission?.reviewed === true;
          
          return {
            id: participant.id || participant.studentId,
            name: studentName || '알 수 없음',
            studentId: participant.studentId || participant.userId || '',
            profileImage: participant.profileImage || '/profile.png',
            submitted: isSubmitted,
            reviewed: isReviewed,
            reviewStatus: reviewStatus,
            submission: submission // 제출된 경우 원본 submission 데이터 보존
          };
        });
      } else {
        // 참가자 목록이 없으면 제출 현황만 사용
        participantsData = submissionsData.map(submission => {
          // submission이 이미 participants 형식인 경우 그대로 사용
          if (submission.submitted !== undefined && (submission.name || submission.studentName)) {
            return {
              ...submission,
              name: submission.name || submission.studentName || '알 수 없음'
            };
          }
          
          // submission 객체가 존재하면 제출됨으로 간주
          const student = submission.student || submission.user || {};
          // 학생 이름 필드 확인 (studentName, name 등 여러 가능한 필드명)
          const studentName = student.studentName || student.name || student.userName || 
                             submission.studentName || submission.name || '';
          
          // 평가 상태 확인
          const reviewStatus = submission.status || 
                              submission.reviewStatus || 
                              submission.review?.status ||
                              null;
          // 평가 완료는 APPROVED 또는 REVIEWED 상태만 (PENDING은 보류 상태이므로 평가 완료 아님)
          const isReviewed = reviewStatus === 'APPROVED' || 
                           reviewStatus === 'REVIEWED' ||
                           submission.reviewed === true;
          
          return {
            id: submission.id || student.id || submission.studentId,
            name: studentName || '알 수 없음',
            studentId: student.studentId || submission.studentId || student.userId || '',
            profileImage: student.profileImage || submission.profileImage || '/profile.png',
            submitted: true, // submission이 존재하면 제출됨
            reviewed: isReviewed,
            reviewStatus: reviewStatus,
            submission: submission // 원본 submission 데이터 보존
          };
        });
      }

      console.log('✅ 변환된 제출 현황:', participantsData);
      setSubmissions(participantsData);
    } catch (error) {
      console.error('제출 현황 조회 실패:', error);
      console.error('에러 상태:', error.response?.status);
      console.error('에러 메시지:', error.response?.data);
      
      // 404나 501 등은 API 미구현으로 간주
      if (error.response?.status === 404 || error.response?.status === 501) {
        console.warn('제출 현황 API가 아직 구현되지 않았습니다.');
        setSubmissions([]);
      } else {
        setSubmissions([]);
      }
    } finally {
      setLoadingSubmissions(false);
    }
  }, [selectedPost, classId]);

  // selectedPost가 변경될 때 기존 첨부파일 로드 (Hooks는 조건문 전에 호출되어야 함)
  useEffect(() => {
    if (selectedPost) {
      // 기존 첨부파일 정보 로드 (attachments 또는 files 필드 확인)
      const attachments = selectedPost.attachments || selectedPost.files || [];
      setExistingAttachments(Array.isArray(attachments) ? attachments : []);
      
      // 과제인 경우 제출 현황 자동 로드
      if (selectedPost.type === '과제' && classId) {
        fetchSubmissions();
      }
    } else {
      setExistingAttachments([]);
      setSubmissions([]);
    }
  }, [selectedPost, classId, fetchSubmissions]);

  // 모달이 열려있을 때 주기적으로 제출 현황 새로고침 (30초마다, 불필요한 요청 방지)
  useEffect(() => {
    if (!isAssignmentStatusOpen || !selectedPost || selectedPost.type !== '과제' || !classId) {
      return;
    }

    // 첫 로드는 이미 fetchSubmissions에서 처리되므로, interval만 설정
    const interval = setInterval(() => {
      console.log('🔄 제출 현황 자동 새로고침');
      fetchSubmissions();
    }, 30000); // 30초마다 새로고침 (5초는 너무 짧음)

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAssignmentStatusOpen, selectedPost?.id, classId]); // fetchSubmissions를 의존성에서 제거하여 무한 루프 방지

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', { 
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  // 과제 만료일 포맷팅 함수
  const formatDueDate = (dateString) => {
    if (!dateString) return '미설정';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}년 ${month}월 ${day}일`;
    } catch (error) {
      return dateString;
    }
  };

  // 파일 타입 확인 헬퍼 함수
  const getFileType = (fileName) => {
    if (!fileName) return 'unknown';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
      return 'image';
    }
    if (ext === 'pdf') {
      return 'pdf';
    }
    return 'other';
  };

  // 파일 URL 가져오기
  const getFileUrl = (file) => {
    if (file.url) return file.url;
    if (file.fileUrl) return file.fileUrl;
    if (file.downloadUrl) return file.downloadUrl;
    return null;
  };

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
    setEditTitle(selectedPost.title || '');
    setEditContent(selectedPost.content || '');
    // dueDate 또는 deadline 필드에서 만료기간 가져오기
    const deadline = selectedPost.dueDate || selectedPost.deadline || '';
    // 날짜 형식 변환 (YYYY-MM-DD)
    if (deadline) {
      const date = new Date(deadline);
      if (!isNaN(date.getTime())) {
        setEditDeadline(date.toISOString().split('T')[0]);
      } else {
        setEditDeadline('');
      }
    } else {
      setEditDeadline('');
    }
    // 기존 첨부파일 설정
    const attachments = selectedPost.attachments || selectedPost.files || [];
    setExistingAttachments(Array.isArray(attachments) ? attachments : []);
    setEditAttachments([]);
    setIsEditMode(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    setEditAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveNewFile = (fileId) => {
    setEditAttachments(prev => {
      const fileToRemove = prev.find(att => att.id === fileId);
      if (fileToRemove && fileToRemove.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(att => att.id !== fileId);
    });
  };

  const handleRemoveExistingFile = (fileId) => {
    setExistingAttachments(prev => prev.filter(att => att.id !== fileId));
  };

  const handleEditSave = async () => {
    if (!onPostUpdate || !classId || !selectedPost) {
      console.error('수정 함수 또는 클래스 ID가 없습니다.');
      return;
    }

    try {
      const formData = new FormData();
      const dto = {
        title: editTitle.trim(),
        content: editContent.trim(),
        type: selectedPost.type || '공지'
      };

      // 과제인 경우 만료기간 추가
      if (selectedPost.type === '과제' && editDeadline) {
        dto.dueDate = editDeadline;
      }

      const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
      formData.append('dto', dtoBlob);

      // 새로 추가된 파일들
      if (editAttachments.length > 0) {
        editAttachments.forEach(att => {
          formData.append('files', att.file);
        });
      }

      // 삭제할 파일 ID 목록 (기존 파일 중 제거된 것들)
      const originalAttachments = selectedPost.attachments || selectedPost.files || [];
      const removedFileIds = originalAttachments
        .filter(orig => !existingAttachments.find(ex => ex.id === orig.id))
        .map(file => file.id);
      
      if (removedFileIds.length > 0) {
        formData.append('deletedFileIds', JSON.stringify(removedFileIds));
      }

      await onPostUpdate(selectedPost.id, formData);
      setIsEditMode(false);
      // 정리
      editAttachments.forEach(att => {
        if (att.url) URL.revokeObjectURL(att.url);
      });
      setEditAttachments([]);
      // 수정 후 상위 컴포넌트에서 데이터를 새로고침하므로 여기서는 새로고침 불필요
    } catch (error) {
      console.error('게시물 수정 실패:', error);
      alert('게시물 수정에 실패했습니다.');
    }
  };


  const handleViewSubmissions = async () => {
    // 모달을 열기 전에 제출 현황을 먼저 새로고침
    await fetchSubmissions();
    setIsAssignmentStatusOpen(true);
  };

  const handleReviewSubmission = (participant) => {
    // participant 객체에서 원본 submission 데이터 추출
    const originalSubmission = participant.submission || participant;
    
    // 제출물 평가 모달에 전달할 데이터 구조 변환
    const submissionData = {
      // Submission ID (API 호출에 필요)
      id: originalSubmission.id || 
          originalSubmission.submissionId || 
          participant.id ||
          null,
      
      // 학생 정보
      studentName: participant.name || originalSubmission.studentName || originalSubmission.student?.name || originalSubmission.user?.name || '알 수 없음',
      studentId: participant.studentId || originalSubmission.studentId || originalSubmission.student?.studentId || originalSubmission.user?.studentId || '',
      profileImage: participant.profileImage || originalSubmission.profileImage || originalSubmission.student?.profileImage || originalSubmission.user?.profileImage || '/profile.png',
      
      // 제출 시간 (여러 가능한 필드명 확인)
      submittedAt: originalSubmission.submittedAt || 
                   originalSubmission.submittedDate || 
                   originalSubmission.createdAt || 
                   originalSubmission.submitDate ||
                   originalSubmission.submissionDate ||
                   null,
      
      // 제출 파일 (여러 가능한 필드명 확인)
      attachments: originalSubmission.files || 
                   originalSubmission.attachments || 
                   originalSubmission.submissionFiles ||
                   originalSubmission.fileList ||
                   [],
      
      // 원본 데이터 보존 (추가 정보가 필요한 경우)
      originalSubmission: originalSubmission
    };
    
    console.log('📋 제출물 평가 데이터:', submissionData);
    setSelectedSubmission(submissionData);
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async (reviewData) => {
    try {
      // submission ID 확인
      if (!selectedSubmission || !selectedSubmission.id) {
        console.error('Submission ID가 없습니다:', selectedSubmission);
        alert('제출물 정보를 찾을 수 없습니다.');
        return;
      }

      const token = localStorage.getItem('accessToken');
      
      // 백엔드 API가 기대하는 형식으로 status 변환
      // '통과' -> 'APPROVED', '재제출요청' -> 'REVIEWED', '보류' -> 'PENDING' 등
      const statusMap = {
        '통과': 'APPROVED',
        '재제출요청': 'REVIEWED',
        '보류': 'PENDING'
      };
      
      const apiReviewData = {
        feedback: reviewData.feedback || '',
        status: statusMap[reviewData.status] || reviewData.status || 'REVIEWED'
      };
      
      console.log('📤 평가 저장 요청:', {
        url: `/api/classes/${classId}/posts/${selectedPost.id}/submissions/${selectedSubmission.id}/review`,
        data: apiReviewData
      });
      
      await axios.post(
        `/api/classes/${classId}/posts/${selectedPost.id}/submissions/${selectedSubmission.id}/review`, 
        apiReviewData, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('평가가 저장되었습니다.');
      setIsReviewModalOpen(false);
      setSelectedSubmission(null);
      // 제출 현황 새로고침
      fetchSubmissions();
    } catch (error) {
      console.error('평가 저장 실패:', error);
      console.error('에러 응답:', error.response?.data);
      console.error('에러 상태:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          '평가 저장에 실패했습니다.';
      alert(`평가 저장 실패: ${errorMessage}`);
    }
  };

  return (
    <div className="class-detail-sidebar">
      <div className="sidebar-header">
        {/* X 버튼 제거 */}
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
                <div className="form-group">
                  <label>만료 기간</label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label>첨부파일</label>
                  {/* 기존 첨부파일 목록 */}
                  {existingAttachments.length > 0 && (
                    <div className="existing-attachments-list">
                      {existingAttachments.map((file) => (
                        <div key={file.id || file.fileId} className="attachment-item">
                          <File size={14} className="file-icon" />
                          <span className="file-name">{file.name || file.fileName || '파일'}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingFile(file.id || file.fileId)}
                            className="remove-file-btn"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 새 파일 추가 */}
                  <div className="file-upload-section">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="edit-file-upload-assignment"
                      accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                    />
                    <label htmlFor="edit-file-upload-assignment" className="file-upload-label">
                      <Upload size={16} />
                      <span>파일 추가</span>
                    </label>
                  </div>
                  {/* 새로 추가된 파일 목록 */}
                  {editAttachments.length > 0 && (
                    <div className="new-attachments-list">
                      {editAttachments.map((att) => (
                        <div key={att.id} className="attachment-item">
                          <File size={14} className="file-icon" />
                          <span className="file-name">{att.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewFile(att.id)}
                            className="remove-file-btn"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="edit-actions">
                  <button 
                    onClick={() => {
                      setIsEditMode(false);
                      // 정리
                      editAttachments.forEach(att => {
                        if (att.url) URL.revokeObjectURL(att.url);
                      });
                      setEditAttachments([]);
                    }}
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
                    <p className="period-text">과제 만료일: {formatDueDate(selectedPost.dueDate || selectedPost.deadline)}</p>
                  </div>
                  
                  <p className="post-content">
                    {selectedPost.content || '과제 내용이 아직 준비되지 않았습니다.'}
                  </p>

                  {/* 첨부파일 표시 */}
                  {existingAttachments.length > 0 && (
                    <div className="attachments-display">
                      <label className="attachments-label">첨부파일</label>
                      <div className="attachments-list">
                        {existingAttachments.map((file) => {
                          const fileName = file.name || file.fileName || '파일';
                          const fileType = getFileType(fileName);
                          const fileUrl = getFileUrl(file);
                          
                          return (
                            <div key={file.id || file.fileId} className="attachment-item-display">
                              {fileType === 'image' && fileUrl ? (
                                <div className="attachment-preview image-preview">
                                  <img 
                                    src={fileUrl} 
                                    alt={fileName}
                                    className="preview-image"
                                    onClick={() => fileUrl && window.open(fileUrl, '_blank')}
                                  />
                                  <span className="file-name">{fileName}</span>
                                </div>
                              ) : fileType === 'pdf' && fileUrl ? (
                                <div className="attachment-preview pdf-preview">
                                  <iframe 
                                    src={fileUrl}
                                    className="preview-pdf"
                                    title={fileName}
                                  />
                                  <span className="file-name">{fileName}</span>
                                </div>
                              ) : (
                                <div className="attachment-preview other-preview">
                                  <File size={14} className="file-icon" />
                                  <span className="file-name">{fileName}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 버튼들 */}
                <div className="admin-actions-section">
                  <div className="admin-buttons-row">
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
                  </div>
                  <button
                    onClick={async () => {
                      if (window.confirm('게시물을 삭제하시겠습니까?')) {
                        if (onPostDelete && classId && selectedPost) {
                          try {
                            await onPostDelete(selectedPost.id);
                            onClose();
                          } catch (error) {
                            console.error('게시물 삭제 실패:', error);
                            alert('게시물 삭제에 실패했습니다.');
                          }
                        } else {
                          console.error('삭제 실패: 필요한 정보가 없습니다.', {
                            onPostDelete: !!onPostDelete,
                            classId,
                            selectedPost: !!selectedPost
                          });
                          alert('게시물 삭제에 필요한 정보가 없습니다.');
                        }
                      }
                    }}
                    className="delete-button"
                  >
                    <Trash2 size={16} />
                    삭제하기
                  </button>
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
                <div className="form-group">
                  <label>첨부파일</label>
                  {/* 기존 첨부파일 목록 */}
                  {existingAttachments.length > 0 && (
                    <div className="existing-attachments-list">
                      {existingAttachments.map((file) => (
                        <div key={file.id || file.fileId} className="attachment-item">
                          <File size={14} className="file-icon" />
                          <span className="file-name">{file.name || file.fileName || '파일'}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingFile(file.id || file.fileId)}
                            className="remove-file-btn"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 새 파일 추가 */}
                  <div className="file-upload-section">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="edit-file-upload-notice"
                      accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                    />
                    <label htmlFor="edit-file-upload-notice" className="file-upload-label">
                      <Upload size={16} />
                      <span>파일 추가</span>
                    </label>
                  </div>
                  {/* 새로 추가된 파일 목록 */}
                  {editAttachments.length > 0 && (
                    <div className="new-attachments-list">
                      {editAttachments.map((att) => (
                        <div key={att.id} className="attachment-item">
                          <File size={14} className="file-icon" />
                          <span className="file-name">{att.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewFile(att.id)}
                            className="remove-file-btn"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="edit-actions">
                  <button 
                    onClick={() => {
                      setIsEditMode(false);
                      // 정리
                      editAttachments.forEach(att => {
                        if (att.url) URL.revokeObjectURL(att.url);
                      });
                      setEditAttachments([]);
                    }}
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
                  {/* 공지 생성 날짜 */}
                  {selectedPost.createdAt && (
                    <div className="post-date">
                      <span className="date-text">작성일: {formatDate(selectedPost.createdAt)}</span>
                    </div>
                  )}
                  <p className="post-content">
                    {selectedPost.content || '공지 내용이 아직 준비되지 않았습니다.'}
                  </p>

                  {/* 첨부파일 표시 */}
                  {existingAttachments.length > 0 && (
                    <div className="attachments-display">
                      <label className="attachments-label">첨부파일</label>
                      <div className="attachments-list">
                        {existingAttachments.map((file) => {
                          const fileName = file.name || file.fileName || '파일';
                          const fileType = getFileType(fileName);
                          const fileUrl = getFileUrl(file);
                          
                          return (
                            <div key={file.id || file.fileId} className="attachment-item-display">
                              {fileType === 'image' && fileUrl ? (
                                <div className="attachment-preview image-preview">
                                  <img 
                                    src={fileUrl} 
                                    alt={fileName}
                                    className="preview-image"
                                    onClick={() => fileUrl && window.open(fileUrl, '_blank')}
                                  />
                                  <span className="file-name">{fileName}</span>
                                </div>
                              ) : fileType === 'pdf' && fileUrl ? (
                                <div className="attachment-preview pdf-preview">
                                  <iframe 
                                    src={fileUrl}
                                    className="preview-pdf"
                                    title={fileName}
                                  />
                                  <span className="file-name">{fileName}</span>
                                </div>
                              ) : (
                                <div className="attachment-preview other-preview">
                                  <File size={14} className="file-icon" />
                                  <span className="file-name">{fileName}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 버튼들 */}
                <div className="admin-actions-section">
                    <button 
                      onClick={handleEditStart} 
                      className="edit-button"
                    >
                      수정하기
                    </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('게시물을 삭제하시겠습니까?')) {
                        if (onPostDelete && classId && selectedPost) {
                          try {
                            await onPostDelete(selectedPost.id);
                            onClose();
                          } catch (error) {
                            console.error('게시물 삭제 실패:', error);
                            alert('게시물 삭제에 실패했습니다.');
                          }
                        } else {
                          console.error('삭제 실패: 필요한 정보가 없습니다.', {
                            onPostDelete: !!onPostDelete,
                            classId,
                            selectedPost: !!selectedPost
                          });
                          alert('게시물 삭제에 필요한 정보가 없습니다.');
                        }
                      }
                    }}
                    className="delete-button"
                  >
                    <Trash2 size={16} />
                    삭제하기
                  </button>
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
