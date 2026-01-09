import React, { useState } from 'react';
import './ForgotPasswordModal.css';
import axiosInstance from '../../api/axiosInstance';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'code', 'reset', 'success'
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    try {
      // 비밀번호 재설정 코드 전송
      await axiosInstance.post('/api/user/password/reset/send-code', { email });
      setStep('code');
    } catch (err) {
      console.error('인증 코드 전송 실패:', err?.response?.data || err.message);
      setErrorMessage(err?.response?.data?.message || '인증 코드 전송에 실패했습니다.');
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!verificationCode) {
      setErrorMessage('인증 코드를 입력해주세요.');
      return;
    }

    try {
      // 이메일 인증 및 임시 비밀번호 발급
      const response = await axiosInstance.post('/api/user/password/reset/verify', {
        email,
        code: verificationCode
      });
      setTempPassword(response.data?.data?.tempPassword || verificationCode);
      setStep('reset');
    } catch (err) {
      console.error('인증 코드 확인 실패:', err?.response?.data || err.message);
      setErrorMessage(err?.response?.data?.message || '인증 코드가 올바르지 않습니다.');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword || !confirmPassword) {
      setErrorMessage('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // 비밀번호 재설정
      await axiosInstance.post('/api/user/password/reset/verify', {
        email,
        tempPassword,
        newPassword,
        confirmPassword
      });
      setStep('success');
    } catch (err) {
      console.error('비밀번호 재설정 실패:', err?.response?.data || err.message);
      setErrorMessage(err?.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
    }
  };

  const handleClose = () => {
    setEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setTempPassword('');
    setStep('email');
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
            <h2>비밀번호 재설정</h2>
            <p className="form-description">
              가입하신 이메일을 입력하면 인증 코드를 보내드립니다.
            </p>
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
                required
              />
              {errorMessage && (
                <p className="error-message">{errorMessage}</p>
              )}
              <button type="submit" className="submit-button">
                인증 코드 받기
              </button>
            </form>
          </div>
        ) : step === 'code' ? (
          <div className="forgot-password-form">
            <h2>인증 코드 확인</h2>
            <p className="form-description">
              <strong>{email}</strong>로 보낸 인증 코드를 입력해주세요.
            </p>
            <form onSubmit={handleCodeSubmit}>
              <input
                type="text"
                placeholder="6자리 인증 코드"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="email-input"
                maxLength={6}
                required
              />
              {errorMessage && (
                <p className="error-message">{errorMessage}</p>
              )}
              <button type="submit" className="submit-button">
                인증 코드 확인
              </button>
            </form>
          </div>
        ) : step === 'reset' ? (
          <div className="forgot-password-form">
            <h2>새 비밀번호 설정</h2>
            <p className="form-description">
              새로운 비밀번호를 설정해주세요.
            </p>
            <form onSubmit={handlePasswordReset}>
              <input
                type="password"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="email-input"
                required
              />
              <input
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="email-input"
                required
              />
              {errorMessage && (
                <p className="error-message">{errorMessage}</p>
              )}
              <button type="submit" className="submit-button">
                비밀번호 재설정
              </button>
            </form>
          </div>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p className="success-text">
              비밀번호가 성공적으로<br />
              재설정되었습니다.
            </p>
            <button className="close-button" onClick={handleClose}>
              로그인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
