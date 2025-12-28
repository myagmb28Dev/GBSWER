import { useState } from 'react';
import { X, Upload, File, Image } from 'lucide-react';
import './CommunityWriteModal.css';

const CommunityWriteModal = ({ isOpen, onClose, onSubmit, isAdmin = false }) => {
  const [formData, setFormData] = useState({ title: '', content: '', isAnonymous: false });
  const [attachments, setAttachments] = useState([]);

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

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    onSubmit({ ...formData, attachments });
  };

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
          <h3 className="modal-title">새 글 작성</h3>
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
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="checkbox-input"
              />
              <span>익명으로 작성</span>
            </label>
          </div>

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
            작성하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityWriteModal;
