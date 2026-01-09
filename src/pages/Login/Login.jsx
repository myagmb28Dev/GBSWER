import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './Login.css';
import Footer from '../../components/Footer/Footer';
import ForgotPasswordModal from '../../components/ForgotPasswordModal/ForgotPasswordModal';

const Login = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('student');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!id || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await axiosInstance.post('/api/auth/login', {
        userId: id,
        password: password
      });
      const { accessToken, refreshToken } = response.data.data;
      
      // 두 토큰 모두 저장
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      onLogin(accountType);
    } catch (error) {
      alert('로그인 실패: ' + (error.response?.data?.message || '서버 오류'));
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <h1 className="login-title">GBSWER</h1>
          <div className="account-switch">
            <button
              type="button"
              className={`switch-btn ${accountType === 'student' ? 'active' : ''}`}
              onClick={() => setAccountType('student')}
            >
              학생 계정
            </button>
            <button
              type="button"
              className={`switch-btn ${accountType === 'teacher' ? 'active' : ''}`}
              onClick={() => setAccountType('teacher')}
            >
              선생님 계정
            </button>
            <button
              type="button"
              className={`switch-btn ${accountType === 'admin' ? 'active' : ''}`}
              onClick={() => setAccountType('admin')}
            >
              관리자 계정
            </button>
          </div>
          <div className="login-box">
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="text"
                placeholder="아이디를 입력하세요"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="login-input"
              />
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
              <button type="submit" className="login-button">
                로그인
              </button>
              <button 
                type="button"
                className="forgot-link"
                onClick={() => setIsForgotPasswordOpen(true)}
              >
                비밀번호를 잊으셨나요?
              </button>
            </form>
          </div>
        </div>
        <div className="login-right">
          <img src="/Loginbackground.png" alt="배경" className="background-image" />
          <img src="/friends.png" alt="캐릭터" className="characters-image" />
        </div>
      </div>
      <ForgotPasswordModal 
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
      <Footer />
    </div>
  );
};

export default Login;
