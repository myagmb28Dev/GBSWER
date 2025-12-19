import React, { useState } from 'react';
import './Login.css';
import Footer from '../../components/Footer/Footer';

const Login = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('student'); // 'student' 또는 'admin'

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('로그인 시도:', { id, password, accountType });
    
    // 간단한 로그인 검증 (실제로는 백엔드 API 호출)
    if (id && password) {
      onLogin(); // 로그인 성공 시 App.js의 setIsLoggedIn(true) 호출
    } else {
      alert('아이디와 비밀번호를 입력해주세요.');
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
              <a href="/forgot-password" className="forgot-link">
                비밀번호를 잊으셨나요?
              </a>
            </form>
          </div>
        </div>
        <div className="login-right">
          <img src="/Loginbackground.png" alt="배경" className="background-image" />
          <img src="/friends.png" alt="캐릭터" className="characters-image" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
