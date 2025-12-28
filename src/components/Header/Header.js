import './Header.css';
import React, { useState } from 'react';
import { useAppContext } from '../../App';

function Header() {
    const { setCurrentPage, handleLogout, userRole } = useAppContext();
    const [showLogoutMenu, setShowLogoutMenu] = useState(false);

    function goToMain() {
        setCurrentPage('main');
    }
    function goToCommunity() {
        setCurrentPage('community');
    }
    function goToMyPage() {
        setCurrentPage('mypage');
    }

    function goToClassroom() {
        setCurrentPage('classroom');
    }

    const handleProfileClick = () => {
        setShowLogoutMenu(!showLogoutMenu);
    };

    const handleLogoutClick = () => {
        setShowLogoutMenu(false);
        handleLogout();
    };

    return (
        <div className="header">
            <img src="/logo.png" alt="로고" className="logo" onClick={goToMain} />
            <div className="right">
                <a href="#main" onClick={(e) => { e.preventDefault(); goToMain(); }}>메인</a>
                <a href="#community" onClick={(e) => { e.preventDefault(); goToCommunity(); }}>커뮤니티</a>
                <a href="#classroom" onClick={(e) => { e.preventDefault(); goToClassroom(); }}>클래스룸</a>
                <a href="#mypage" onClick={(e) => { e.preventDefault(); goToMyPage(); }}>마이페이지</a>
                <div className="profile-menu">
                    <img 
                        src="/profile.png" 
                        alt="프로필" 
                        className="profile" 
                        onClick={handleProfileClick}
                    />
                    {showLogoutMenu && (
                        <div className="logout-dropdown">
                            <div className="user-info">
                                {userRole === 'admin' ? '관리자' :
                                 userRole === 'teacher' ? '선생님' : '학생'} 계정
                            </div>
                            <button
                                className="logout-btn"
                                onClick={handleLogoutClick}
                            >
                                로그아웃
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Header;