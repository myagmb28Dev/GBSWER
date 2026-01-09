import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './Withdraw.css';

const Withdraw = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleWithdraw = async () => {
    setLoading(true);
    setError('');
    try {
      await axiosInstance.delete('/api/user/withdraw');
      setSuccess(true);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (err) {
      setError('회원 탈퇴에 실패했습니다.');
    }
    setLoading(false);
  };

  if (success) return <div>회원 탈퇴가 완료되었습니다.</div>;

  return (
    <div className="withdraw-container">
      <h2>회원 탈퇴</h2>
      <button className="withdraw-btn" onClick={handleWithdraw} disabled={loading}>
        {loading ? '처리 중...' : '회원 탈퇴하기'}
      </button>
      {error && <div className="withdraw-error">{error}</div>}
    </div>
  );
};

export default Withdraw;
