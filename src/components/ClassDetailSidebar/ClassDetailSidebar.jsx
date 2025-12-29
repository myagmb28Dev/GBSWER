import React, { useState } from 'react';
import { File, Plus } from 'lucide-react';
import AssignmentStatusModal from '../AssignmentStatusModal/AssignmentStatusModal';
import { useAppContext } from '../../App';
import './ClassDetailSidebar.css';

const ClassDetailSidebar = ({
  selectedPost = null,
  onClose,
  onSubmitAssignment,
  onUpdateSubmission
}) => {
  // 기본 디버그: 컴포넌트가 렌더링되는지 확인
  // eslint-disable-next-line no-console
  console.log('🎯 ClassDetailSidebar rendered, selectedPost:', selectedPost);
  const { userRole } = useAppContext();
  // 게시물 본문을 여러 가능한 키에서 찾아 반환하는 헬퍼
  const resolveContent = (post) => {
    if (!post || typeof post !== 'object') return '';

    // 새로운 API 명세서에 따라 content를 우선적으로 확인
    if (post.content && String(post.content).trim() !== '') {
      // eslint-disable-next-line no-console
      console.log('✅ Found content:', post.content);
      return post.content;
    }

    // description도 확인 (호환성을 위해)
    if (post.description && String(post.description).trim() !== '') {
      // eslint-disable-next-line no-console
      console.log('✅ Found description:', post.description);
      return post.description;
    }

    // 가능한 다른 키 목록 (description 다음 우선순위)
    const keys = [
      'content', 'body', 'detail', 'text', 'desc', 'message', 'note',
      'contents', 'data', 'value', 'html', 'markdown', 'summary', 'info', 'details'
    ];

    // 직접 키 확인
    for (const k of keys) {
      if (post[k] && String(post[k]).trim() !== '') return post[k];
    }

    // 중첩된 data 객체에 들어있는 경우도 검사
    if (post.data && typeof post.data === 'object') {
      // description 우선 확인
      if (post.data.description && String(post.data.description).trim() !== '') {
        return post.data.description;
      }
      for (const k of keys) {
        if (post.data[k] && String(post.data[k]).trim() !== '') return post.data[k];
      }
    }

    // 중첩된 객체에서 재귀적으로 찾기
    const findContent = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      // description 우선 확인
      if (obj.description && String(obj.description).trim() !== '') return obj.description;
      for (const k of keys) {
        if (obj[k] && String(obj[k]).trim() !== '') return obj[k];
      }
      return null;
    };

    // 모든 중첩 객체 탐색
    for (const key in post) {
      if (post[key] && typeof post[key] === 'object') {
        const found = findContent(post[key]);
        if (found) return found;
      }
    }

    return '';
  };
  // 선택된 게시물이 바뀔 때 디버그 정보를 남김
  if (typeof window !== 'undefined' && selectedPost) {
    // 상세한 디버그: 개발시 콘솔에서 확인
    // eslint-disable-next-line no-console
    console.log('🔍 ClassDetailSidebar selectedPost:', selectedPost);
    // eslint-disable-next-line no-console
    console.log('🔍 selectedPost keys:', Object.keys(selectedPost));
    // eslint-disable-next-line no-console
    console.log('🔍 selectedPost content:', selectedPost.content);
    // eslint-disable-next-line no-console
    console.log('🔍 selectedPost description:', selectedPost.description);
    // eslint-disable-next-line no-console
    console.log('🔍 selectedPost type:', selectedPost.type);
    // eslint-disable-next-line no-console
    console.log('🔍 resolveContent result:', resolveContent(selectedPost));
  }
  const [attachments, setAttachments] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
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

  const handleSubmit = async () => {
    // 이미 제출된 경우
    if (isSubmitted) {
      setShowSubmitNotification(true);
      setTimeout(() => setShowSubmitNotification(false), 2000);
      return;
    }

    try {
      const submissionData = {
        files: uploadedFiles
      };

      if (onSubmitAssignment) {
        await onSubmitAssignment(selectedPost.id, submissionData);
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('제출 실패:', error);
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
              
              
              <p className="post-content">
                {selectedPost.content || "과제 내용이 아직 준비되지 않았습니다."}
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
                {selectedPost.content || "공지 내용이 아직 준비되지 않았습니다."}
              </p>
            </div>

            {/* 캐릭터 */}
            <div className="character-section">
              <img src="/meister-game.png" alt="마이스터 캐릭터" className="sidebar-character" />
              <div className="button-section">
                {userRole !== 'student' && (
                  <button 
                    onClick={() => setIsEditMode(!isEditMode)} 
                    className="edit-button"
                  >
                    수정하기
                  </button>
                )}
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