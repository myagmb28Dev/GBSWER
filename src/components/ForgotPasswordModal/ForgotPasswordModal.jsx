import React, { useState } from 'react';
import './ForgotPasswordModal.css';
import { studentUser, adminUser } from '../../mocks/mockUsers';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'success'
  const [foundUser, setFoundUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    // 임시 데이터에서 사용자 찾기
    let user = null;
    if (email === studentUser.email) {
      user = studentUser;
    } else if (email === adminUser.email) {
      user = adminUser;
    }

    if (user) {
      setFoundUser(user);
      setStep('success');
    } else {
      setErrorMessage('등록되지 않은 이메일입니다.');
    }
  };

  const handleClose = () => {
    setEmail('');
    setStep('email');
    setFoundUser(null);
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>

        {step === 'email' ? (
          <div className="forgot-password-form">
            <h2>비밀번호 찾기</h2>
            <p className="form-description">
              가입하신 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.
            </p>
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
              />
              {errorMessage && (
                <p className="error-message">{errorMessage}</p>
              )}
              <button type="submit" className="submit-button">
                비밀번호 찾기
              </button>
            </form>
          </div>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p className="success-text">
              <strong>{foundUser?.email}</strong>로<br />
              비밀번호 재설정 링크를 보냈습니다.
            </p>
            <button className="close-button" onClick={handleClose}>
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
