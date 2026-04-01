import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, File, Image } from 'lucide-react';
import { useAppContext } from '../../App';
import './PostWriteModal.css';

const PostWriteModal = ({ isOpen, onClose, onSubmit, classId, initialType = '공지', isClassroomContext = false }) => {
  console.log('📋 PostWriteModal props:', { classId, initialType, isClassroomContext });
  const { profile } = useAppContext();
  const [postType, setPostType] = useState(initialType); // '공지' or '과제'
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submissionScope, setSubmissionScope] = useState('마감 자율'); // '기한 이후 제출 마감' or '마감 자율'
  const [attachments, setAttachments] = useState([]);

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
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveFile = (fileId) => {
    setAttachments(prev => {
      const fileToRemove = prev.find(att => att.id === fileId);
      if (fileToRemove && fileToRemove.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(att => att.id !== fileId);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (postType === '과제' && !deadline) {
      alert('과제의 기한을 설정해주세요.');
      return;
    }

    // 클래스룸 컨텍스트에서는 공지 타입도 게시물로 저장
    if (isClassroomContext && postType === '공지') {
      // 클래스룸에서 공지사항은 게시물로 저장 (FormData로 전송)
      const formData = new FormData();
      const processedTitle = title?.trim() || '';
      const processedContent = content?.trim() || '';
      const processedType = '공지';

      // 새로운 API 형식: dto 파트에 JSON 문자열로 전송 (Blob으로 변환하여 Content-Type 명시)
      const dto = {
        title: processedTitle,
        content: processedContent,
        type: processedType
      };
      const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
      formData.append('dto', dtoBlob);

      // 파일은 files 파트로 전송
      if (attachments.length > 0) {
        attachments.forEach(att => {
          formData.append('files', att.file);
        });
      }

      console.log('🎯 게시물 생성 시도!');
      console.log('클래스룸 공지사항 게시물 FormData:');
      console.log('📤 DTO:', dto);
      console.log('📤 파일 개수:', attachments.length);

      try {
        await onSubmit(formData);
      handleReset();
      } catch (error) {
        console.error('게시물 생성 실패:', error);
        // 에러는 상위에서 처리되므로 여기서는 로그만 남김
      }

    } else if (!isClassroomContext && postType === '공지') {
      // 메인페이지에서 공지사항은 Mock 데이터에 추가
      console.log('메인페이지 공지사항 생성');

      // 오늘 날짜를 noticeDate로 설정 (LocalDateTime 형식)
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const noticeDate = `${dateStr}T00:00:00`; // 자정으로 설정

      const noticeData = {
        title: title.trim(),
        content: content.trim(),
        category: '일반', // 기본 카테고리
        author: profile?.name || '관리자',
        noticeDate: noticeDate
      };

      console.log('메인페이지 공지사항 생성 데이터:', noticeData);

      try {
        // 실제 API 호출로 공지사항 생성
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/classes/notices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(noticeData)
        });

        if (!response.ok) {
          throw new Error('공지사항 생성 실패');
        }

        alert('공지사항이 작성되었습니다.');
        window.dispatchEvent(new Event('noticeCreated'));
        handleReset();
        onClose();

      } catch (error) {
        console.error('공지사항 생성 실패:', error);
        alert('공지사항 생성에 실패했습니다.');
      }

    } else {
      // 과제 타입이면 FormData로 전송
      const formData = new FormData();
      const processedTitle = title?.trim() || '';
      const processedContent = content?.trim() || '';
      const processedType = postType || '';

      // 새로운 API 형식: dto 파트에 JSON 문자열로 전송 (Blob으로 변환하여 Content-Type 명시)
      const dto = {
        title: processedTitle,
        content: processedContent,
        type: processedType
      };

      if (postType === '과제' && deadline) {
        dto.dueDate = deadline;
      }

      const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
      formData.append('dto', dtoBlob);

      // 파일은 files 파트로 전송
      if (attachments.length > 0) {
        attachments.forEach(att => {
          formData.append('files', att.file);
        });
      }

      console.log('📤 게시물 생성 FormData:');
      console.log('📤 DTO:', dto);
      console.log('📤 파일 개수:', attachments.length);

      try {
        await onSubmit(formData);
      handleReset();
      } catch (error) {
        console.error('게시물 생성 실패:', error);
        // 에러는 상위에서 처리되므로 여기서는 로그만 남김
      }
    }
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setDeadline('');
    setSubmissionScope('마감 자율');
    setPostType('공지');
    // 첨부파일 정리
    attachments.forEach(att => {
      if (att.url) URL.revokeObjectURL(att.url);
    });
    setAttachments([]);
  };

  const handleClose = () => {
    attachments.forEach(att => {
      if (att.url) URL.revokeObjectURL(att.url);
    });
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="post-write-overlay" onClick={handleClose}>
      <div className="post-write-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">글 작성</h2>
        <button className="close-btn" onClick={handleClose}>
            <X size={14} />
        </button>
        </div>

        <div className="modal-content">
        <form onSubmit={handleSubmit} className="write-form">
          {/* 타입 스위치 */}
          <div className="type-switch">
            <label className="switch-label">
              <input
                type="radio"
                name="postType"
                value="공지"
                checked={postType === '공지'}
                onChange={(e) => setPostType(e.target.value)}
              />
              <span className={`switch-text ${postType === '공지' ? 'active' : ''}`}>공지</span>
            </label>
            <label className="switch-label">
              <input
                type="radio"
                name="postType"
                value="과제"
                checked={postType === '과제'}
                onChange={(e) => setPostType(e.target.value)}
              />
              <span className={`switch-text ${postType === '과제' ? 'active' : ''}`}>과제</span>
            </label>
          </div>


          {/* 제목 */}
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="input-field"
            />
          </div>

          {/* 내용 */}
          <div className="form-group">
            <label htmlFor="content">내용</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              className="textarea-field"
              rows="6"
            />
          </div>

          {/* 과제 전용 필드 */}
          {postType === '과제' && (
            <>
              <div className="form-group">
                <label htmlFor="deadline">기한</label>
                <input
                  type="date"
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>수용범위</label>
                <div className="scope-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="submissionScope"
                      value="기한 이후 제출 마감"
                      checked={submissionScope === '기한 이후 제출 마감'}
                      onChange={(e) => setSubmissionScope(e.target.value)}
                    />
                    <span>기한 이후 제출 마감</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="submissionScope"
                      value="마감 자율"
                      checked={submissionScope === '마감 자율'}
                      onChange={(e) => setSubmissionScope(e.target.value)}
                    />
                    <span>마감 자율</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* 파일 첨부 */}
          <div className="form-group">
            <label className="form-label">파일 첨부 (여러 개 선택 가능)</label>
            <div className="file-upload-area">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="file-input"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
              />
              <label htmlFor="file-upload" className="file-upload-label">
                <Upload size={24} />
                <p>클릭하여 파일을 선택하세요</p>
                <p className="file-hint">이미지, PDF, 문서, 압축 파일</p>
              </label>
            </div>

            {/* 첨부파일 목록 */}
            {attachments.length > 0 && (
              <div className="attachments-list">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="attachment-item">
                    <div className="attachment-info">
                      {attachment.type.startsWith('image/') ? (
                        <Image size={16} className="file-icon" />
                      ) : (
                        <File size={16} className="file-icon" />
                      )}
                      <span className="file-name">{attachment.name}</span>
                      <span className="file-size">({(attachment.size / 1024).toFixed(1)}KB)</span>
                    </div>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() => handleRemoveFile(attachment.id)}
                      title="파일 제거"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              취소
            </button>
            <button type="submit" className="btn-submit">
              작성
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PostWriteModal;
