import React, { useState } from 'react';
import { Upload, File, Plus } from 'lucide-react';
import AssignmentStatusModal from '../AssignmentStatusModal/AssignmentStatusModal';
import './ClassDetailSidebar.css';

const ClassDetailSidebar = ({ 
  selectedPost = null,
  onClose
}) => {
  const [attachments, setAttachments] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [addToSchedule, setAddToSchedule] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitNotification, setShowSubmitNotification] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAssignmentStatusOpen, setIsAssignmentStatusOpen] = useState(false);

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      url: URL.createObjectURL(file)
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    const attachment = attachments.find(att => att.id === id);
    if (attachment && attachment.url) {
      URL.revokeObjectURL(attachment.url);
    }
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const handleAddFile = () => {
    if (attachments.length > 0) {
      setUploadedFiles([...uploadedFiles, ...attachments]);
      setAttachments([]);
    }
  };

  const removeUploadedFile = (id) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
  };

  const handleSubmit = () => {
    // 이미 제출된 경우
    if (isSubmitted) {
      setShowSubmitNotification(true);
      setTimeout(() => setShowSubmitNotification(false), 2000);
      return;
    }
    
    // 과제 제출 로직
    console.log('과제 제출:', uploadedFiles);
    setIsSubmitted(true);
    alert('과제가 제출되었습니다!');
  };

  const handleScheduleChange = (e) => {
    setAddToSchedule(e.target.checked);
    if (e.target.checked) {
      // 개인 일정에 추가하는 로직
      const scheduleItem = {
        id: Date.now(),
        title: selectedPost.title,
        date: '2024-12-25', // 과제 기간 종료일
        type: 'personal'
      };
      console.log('일정 추가:', scheduleItem);
      // 실제로는 상위 컴포넌트나 전역 상태로 전달해야 함
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
            {/* 과제 제목과 내용 */}
            <div className="post-header">
              <h3 className="post-title">{selectedPost.title}</h3>
              
              {/* 과제 기간 */}
              <div className="assignment-period">
                <p className="period-text">과제 기간: 2024.12.20 - 2024.12.25</p>
              </div>
              
              {/* 일정표 추가 체크박스 */}
              <div className="schedule-checkbox">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={addToSchedule}
                    onChange={handleScheduleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">일정표에 추가</span>
                </label>
              </div>
              
              <p className="post-content">
                이것은 과제 내용입니다. 과제에 대한 상세한 설명이 여기에 표시됩니다.
                학생들이 제출해야 할 과제에 대한 자세한 안내사항이 포함되어 있습니다.
              </p>
            </div>

            {/* 업로드된 과제 표기 박스 (캐릭터 바로 위) */}
            {uploadedFiles.length > 0 && (
              <div className="submitted-files-container">
                <div className="submitted-files-box">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="submitted-file-item">
                      <File size={14} className="file-icon" />
                      <span className="file-name">{file.name}</span>
                      <button 
                        onClick={() => removeUploadedFile(file.id)} 
                        className="remove-submitted-file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 캐릭터와 버튼들 */}
            <div className="character-section">
              <img src="/meister-game.png" alt="마이스터 캐릭터" className="sidebar-character" />
              <div className="button-section">
                <button 
                  onClick={handleSubmit} 
                  className={`submit-button ${isSubmitted ? 'submitted' : ''}`}
                >
                  {isSubmitted ? '수정하기' : '제출하기'}
                </button>
                <div className="add-file-section">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    className="hidden" 
                    id="assignment-file-upload" 
                    accept="image/*,.pdf,.doc,.docx,.txt" 
                  />
                  <label htmlFor="assignment-file-upload" className="circle-add-button">
                    <Plus size={16} />
                  </label>
                </div>
              </div>
            </div>

            {/* 제출 알림 */}
            {showSubmitNotification && (
              <div className="submit-notification">
                이미 올린 파일입니다
              </div>
            )}

            {/* 선택된 파일 미리보기 */}
            {attachments.length > 0 && (
              <>
                <div className="temp-attachment-list">
                  {attachments.map((att) => (
                    <div key={att.id} className="temp-attachment-item">
                      <File size={12} className="file-icon" />
                      <span className="file-name">{att.name}</span>
                      <button 
                        onClick={() => removeAttachment(att.id)} 
                        className="remove-temp-file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleAddFile} className="upload-confirm-button">
                  추가
                </button>
              </>
            )}
          </>
        ) : (
          // 공지용 레이아웃
          <>
            {/* 공지 제목과 내용 */}
            <div className="post-header">
              <h3 className="post-title">{selectedPost.title}</h3>
              <p className="post-content">
                이것은 공지사항 내용입니다. 중요한 공지사항에 대한 상세한 내용이 여기에 표시됩니다.
                학생들이 꼭 알아야 할 정보들을 포함하고 있습니다.
              </p>
            </div>

            {/* 캐릭터 */}
            <div className="character-section">
              <img src="/meister-game.png" alt="마이스터 캐릭터" className="sidebar-character" />
              <div className="button-section">
                <button 
                  onClick={() => setIsEditMode(!isEditMode)} 
                  className="edit-button"
                >
                  수정하기
                </button>
              </div>
            </div>
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

export default ClassDetailSidebar;