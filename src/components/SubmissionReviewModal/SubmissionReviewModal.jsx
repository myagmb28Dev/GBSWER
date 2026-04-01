import React, { useState } from 'react';
import { X, File } from 'lucide-react';
import './SubmissionReviewModal.css';

const SubmissionReviewModal = ({
  isOpen,
  onClose,
  submission,
  assignmentTitle,
  onSaveReview
}) => {
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('통과'); // '통과', '재제출요청', '보류'

  const handleSave = () => {
    const reviewData = {
      feedback: feedback.trim(),
      status: status
    };

    onSaveReview(reviewData);
  };

  const handleClose = () => {
    setFeedback('');
    setStatus('통과');
    onClose();
  };

  if (!isOpen || !submission) return null;

  return (
    <div className="submission-review-overlay" onClick={handleClose}>
      <div className="submission-review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">제출물 평가</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* 과제 정보 */}
          <div className="assignment-info">
            <h3 className="assignment-title">{assignmentTitle}</h3>
            <div className="submission-info">
              <div className="student-info">
                <img
                  src={submission.profileImage || '/profile.png'}
                  alt={submission.studentName}
                  className="student-avatar"
                />
                <div className="student-details">
                  <div className="student-name-row">
                    <span className="student-name">{submission.studentName}</span>
                    <span className="student-id">{submission.studentId}</span>
                  </div>
                  <div className="submission-time">
                    제출 시간: {submission.submittedAt ? (
                      (() => {
                        try {
                          const date = new Date(submission.submittedAt);
                          return isNaN(date.getTime()) ? '제출 시간 정보 없음' : date.toLocaleString('ko-KR');
                        } catch (error) {
                          return '제출 시간 정보 없음';
                        }
                      })()
                    ) : '제출 시간 정보 없음'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 첨부 파일 목록 */}
          <div className="attachments-section">
            <h4 className="section-title">제출 파일</h4>
            <div className="attachments-list">
              {(() => {
                // 여러 가능한 필드명에서 파일 목록 추출
                const files = submission.attachments || 
                             submission.files || 
                             submission.submissionFiles ||
                             submission.fileList ||
                             [];
                
                // 배열이 아니거나 비어있는 경우 확인
                const fileList = Array.isArray(files) && files.length > 0 ? files : [];
                
                console.log('📎 제출 파일 목록:', fileList);
                
                return fileList.length > 0 ? (
                  fileList.map((file, index) => {
                    // 파일 이름 추출 (여러 가능한 필드명 확인)
                    const fileName = file.fileName || 
                                    file.name || 
                                    file.originalFileName ||
                                    file.originalName ||
                                    '파일';
                    
                    // 파일 URL 추출 (다운로드 링크)
                    const fileUrl = file.url || 
                                  file.fileUrl || 
                                  file.downloadUrl ||
                                  file.file?.url ||
                                  null;
                    
                    console.log('📄 파일 정보:', { 
                      fileName, 
                      fileUrl, 
                      file,
                      originalSubmission: submission.originalSubmission 
                    });
                    
                    return (
                      <div key={file.id || file.fileId || index} className="attachment-item">
                        <File size={16} className="file-icon" />
                        {fileUrl ? (
                          <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="file-name-link"
                          >
                            <span className="file-name">{fileName}</span>
                          </a>
                        ) : (
                          <span className="file-name">{fileName}</span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="no-attachments">첨부 파일이 없습니다.</p>
                );
              })()}
            </div>
          </div>

          {/* 평가 폼 */}
          <div className="review-section">
            <h4 className="section-title">평가</h4>

            <div className="review-form">
              <div className="form-group">
                <label className="form-label">평가 상태</label>
                <div className="status-options">
                  {[
                    { value: '통과', label: '통과', color: '#4CAF50' },
                    { value: '재제출요청', label: '재제출 요청', color: '#FF9800' },
                    { value: '보류', label: '보류', color: '#9E9E9E' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`status-btn ${status === option.value ? 'active' : ''}`}
                      onClick={() => setStatus(option.value)}
                      style={{
                        '--status-color': option.color,
                        '--status-bg': status === option.value ? option.color : 'transparent',
                        '--status-text-color': status === option.value ? 'white' : option.color
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">피드백</label>
                <textarea
                  className="feedback-textarea"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="학생에게 전달할 피드백을 작성해주세요..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={handleClose}>
            취소
          </button>
          <button className="save-btn" onClick={handleSave}>
            평가 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionReviewModal;
