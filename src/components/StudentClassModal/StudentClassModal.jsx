import React, { useState } from 'react';
import './StudentClassModal.css';

const StudentClassModal = ({ isOpen, onClose, onJoinClass }) => {
  const [classCode, setClassCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!classCode.trim()) {
      alert('클래스 코드를 입력해주세요.');
      return;
    }

    onJoinClass(classCode.trim().toUpperCase());
  };

  const handleClose = () => {
    setClassCode('');
    onClose();
  };

  const handleCodeChange = (e) => {
    // 영문자와 숫자만 허용, 대문자로 변환
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setClassCode(value);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="student-class-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">클래스 참여 코드</h2>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-group">
            <label htmlFor="classCode">클래스 참여 코드</label>
            <input
              type="text"
              id="classCode"
              value={classCode}
              onChange={handleCodeChange}
              placeholder="6자리 코드를 입력하세요"
              className="class-code-input"
              maxLength={6}
            />
            <p className="input-help">
              선생님이 제공한 6자리 클래스 코드를 입력해주세요.
            </p>
          </div>

          <div className="modal-buttons">
            <button type="button" className="cancel-button" onClick={handleClose}>
              취소
            </button>
            <button type="submit" className="join-button">
              클래스 참여
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentClassModal;