import React, { useState } from 'react';
import './PasswordConfirmModal.css';

const PasswordConfirmModal = ({ onClose, onConfirm, currentPassword, userEmail }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === currentPassword) {
      onConfirm();
      onClose();
    } else {
      setError('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleForgotPassword = () => {
    setShowSuccess(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="password-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>비밀번호 확인</h3>
        <p>본인 확인을 위해 비밀번호를 입력해주세요.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="비밀번호 입력"
            autoFocus
          />
          {error && <p className="error-message">{error}</p>}
          {showSuccess && <p className="success-message">임시 비밀번호가 이메일로 전송되었습니다.</p>}
          <button
            type="button"
            className="forgot-password-link"
            onClick={handleForgotPassword}
          >
            비밀번호를 잊으셨습니까?
          </button>
          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="cancel-btn">
              취소
            </button>
            <button type="submit" className="confirm-btn">
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordConfirmModal;
