import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './EmailReset.css';

const EmailReset = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axiosInstance.post('/api/auth/email-reset', { email });
      setMessage('이메일 인증/비밀번호 재설정 메일이 발송되었습니다.');
    } catch (err) {
      setMessage('메일 발송에 실패했습니다.');
    }
    setLoading(false);
  };

  return (
    <div className="email-reset-container">
      <h2>이메일 인증/비밀번호 재설정</h2>
      <form onSubmit={handleSubmit} className="email-reset-form">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="이메일 입력"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? '처리 중...' : '메일 발송'}
        </button>
      </form>
      {message && <div className="email-reset-message">{message}</div>}
    </div>
  );
};

export default EmailReset;
