import React, { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import './AdminClassModal.css';

const AdminClassModal = ({ isOpen, onClose, onCreateClass }) => {
  const [className, setClassName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);

  const generateClassCode = () => {
    // 6자리 랜덤 코드 생성
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
    setIsCodeGenerated(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('클래스 코드가 클립보드에 복사되었습니다!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!className.trim()) {
      alert('반 이름을 입력해주세요.');
      return;
    }
    if (!isCodeGenerated) {
      alert('클래스 코드를 생성해주세요.');
      return;
    }

    onCreateClass({
      className: className.trim(),
      classCode: generatedCode
    });
  };

  const handleClose = () => {
    setClassName('');
    setGeneratedCode('');
    setIsCodeGenerated(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="admin-class-modal" onClick={(e) => e.stopPropagation()}>
<<<<<<< HEAD
        <button className="close-button" onClick={handleClose}>
          <X size={24} />
        </button>

=======
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
        <h2 className="modal-title">클래스 생성하기</h2>

        <label htmlFor="className" className="form-label">반 이름</label>
        <input
          type="text"
          id="className"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="예: 3학년 1반"
          className="class-name-input"
        />

        <label className="form-label">클래스 참여 코드</label>
        <div className="code-display">
          {isCodeGenerated ? (
            <>
              <span className="code-text">{generatedCode}</span>
              <button
                type="button"
                className="copy-button"
                onClick={copyToClipboard}
                title="코드 복사"
              >
                <Copy size={16} />
              </button>
            </>
          ) : (
            <span className="no-code">코드를 생성해주세요</span>
          )}
        </div>
        <button
          type="button"
          className="generate-button"
          onClick={generateClassCode}
        >
          <RefreshCw size={16} />
          {isCodeGenerated ? '새 코드 생성' : '코드 생성'}
        </button>

        <div className="modal-buttons">
          <button type="button" className="cancel-button" onClick={handleClose}>
            취소
          </button>
          <button type="button" className="create-button" onClick={handleSubmit}>
            클래스 생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminClassModal;