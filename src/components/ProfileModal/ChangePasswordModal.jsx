import React, { useState } from 'react';
import axios from 'axios';
import './PasswordConfirmModal.css';

const ChangePasswordModal = ({ onClose, onSave, currentPassword, userEmail }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.newPassword.length < 4) {
      setError('새 비밀번호는 4자 이상이어야 합니다.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put('/api/user/password', formData, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      onSave(formData.newPassword);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || '비밀번호 변경에 실패했습니다.';
      setError(msg);
    }
  };

  const handleForgotPassword = () => {
    setShowSuccess(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="password-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>비밀번호 변경</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            placeholder="기존 비밀번호"
            required
          />
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="새 비밀번호"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="새 비밀번호 확인"
            required
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
              변경
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;