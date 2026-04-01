import { useState, useEffect, useCallback } from 'react';
import { X, Upload, File, Image } from 'lucide-react';
import './CommunityWriteModal.css';

const CommunityWriteModal = ({ isOpen, onClose, onSubmit, isAdmin = false, initialData = null, isEdit = false }) => {
  const memoizedOnSubmit = useCallback((data) => {
    onSubmit(data);
  }, [onSubmit]);
  const [formData, setFormData] = useState({ title: '', content: '', anonymous: false, targetMajor: 'all' });
  const [attachments, setAttachments] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [availableMajors, setAvailableMajors] = useState([]);

  useEffect(() => {
    if (isOpen && !isInitialized) {
      if (initialData) {
        // 수정 모드: 기존 데이터로 초기화 (한 번만)
        // bit(1) 값 처리: 1, '1', true, 'true' 등을 true로 변환
        const isAnonymous = initialData.anonymous === true ||
                           initialData.anonymous === 'true' ||
                           initialData.anonymous === 1 ||
                           initialData.anonymous === '1' ||
                           (typeof initialData.anonymous === 'object' && initialData.anonymous?.[0] === 1);

        setFormData({
          title: initialData.title || '',
          content: initialData.content || '',
          anonymous: isAnonymous,
          targetMajor: initialData.targetMajor || 'all'
        });
        // 기존 첨부파일들을 유지
        setAttachments(initialData.attachments || []);
      } else {
        // 새 글 작성 시 초기화
        setFormData({ title: '', content: '', anonymous: false, targetMajor: 'all' });
        setAttachments([]);
      }
      setIsInitialized(true);
    }
  }, [isOpen, initialData, isInitialized]);

  // 모달이 닫힐 때 초기화 상태 리셋
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
    }
  }, [isOpen]);

  // 학과 목록 초기화
  useEffect(() => {
    if (isOpen && isAdmin) {
      const majors = ['게임개발과', '인공지능소프트웨어개발과', '소프트웨어개발과'];
      setAvailableMajors(majors);
    }
  }, [isOpen, isAdmin]);

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

  const handleSubmit = useCallback(() => {
    if (!formData.title || !formData.content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    memoizedOnSubmit({ ...formData, attachments });
  }, [formData, attachments, memoizedOnSubmit]);

  const handleClose = () => {
    attachments.forEach(att => {
      if (att.url) URL.revokeObjectURL(att.url);
    });
    setFormData({ title: '', content: '', isAnonymous: false });
    setAttachments([]);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isOpen) return null;

  return (
    <div className="community-write-overlay" onClick={handleClose}>
      <div className="community-write-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? '게시글 수정' : '새 글 작성'}</h3>
          <button onClick={handleClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* 제목 */}
          <div className="form-group">
            <label className="form-label">제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
              placeholder="제목을 입력하세요"
            />
          </div>

          {/* 내용 */}
          <div className="form-group">
            <label className="form-label">내용</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="form-textarea"
              placeholder="내용을 입력하세요"
              rows="8"
            />
          </div>

          {/* 익명 체크박스 */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={!!formData.anonymous}  // 명시적 boolean 변환
                onChange={(e) => {
                  setFormData({ ...formData, anonymous: e.target.checked });
                }}
                className="checkbox-input"
              />
              <span>익명으로 작성</span>
            </label>
          </div>

          {/* 학과 선택 (관리자만) */}
          {isAdmin && (
            <div className="form-group">
              <label className="form-label">대상 학과</label>
              <select
                value={formData.targetMajor}
                onChange={(e) => setFormData({ ...formData, targetMajor: e.target.value })}
                className="major-select"
              >
                <option value="all">전체 학과</option>
                {availableMajors.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 파일 첨부 */}
          <div className="form-group">
            <label className="form-label">파일 첨부</label>
            <div className="file-upload-area">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="file-input"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <label htmlFor="file-upload" className="file-upload-label">
                <Upload size={24} />
                <p>클릭하여 파일을 선택하세요</p>
                <p className="file-hint">이미지, PDF, 문서 파일</p>
              </label>
            </div>

            {/* 첨부 파일 목록 */}
            {attachments.length > 0 && (
              <div className="attachments-list">
                {attachments.map((att) => (
                  <div key={att.id} className="attachment-item">
                    <div className="attachment-info">
                      {att.type.startsWith('image/') ? (
                        <Image size={16} className="attachment-icon" />
                      ) : (
                        <File size={16} className="attachment-icon" />
                      )}
                      <div>
                        <p className="attachment-name">{att.name}</p>
                        <p className="attachment-size">{formatFileSize(att.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="remove-btn"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className="modal-footer">
          <button onClick={handleClose} className="btn-cancel">
            취소
          </button>
          <button onClick={handleSubmit} className="btn-submit">
            {isEdit ? '수정하기' : '작성하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityWriteModal;
