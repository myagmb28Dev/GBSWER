import './Header.css';
import React from 'react';
import { useAppContext } from '../../App';

function Header({ onNavigate, onProfileClick }) {
    // Context 사용을 시도하고, 없으면 props 사용
    let setCurrentPage, setShowProfileModal;
    
    try {
        const context = useAppContext();
        setCurrentPage = context.setCurrentPage;
        setShowProfileModal = context.setShowProfileModal;
    } catch (error) {
        // Context가 없는 경우 props 사용
        setCurrentPage = onNavigate || (() => {});
        setShowProfileModal = onProfileClick || (() => {});
    }

    function goToMain() {
        setCurrentPage('main');
    }

    function goToCommunity() {
        setCurrentPage('community');
    }

    function goToMyPage() {
        setCurrentPage('mypage');
    }

    function goToAssignments() {
        setCurrentPage('assignments');
    }

    function handleProfileClick() {
        setShowProfileModal(true);
    }

return (
    <div className="header">
        <img src="/logo.png" alt="로고" className="logo" onClick={goToMain} />
        <div className="right">
            <a href="#main" onClick={(e) => { e.preventDefault(); goToMain(); }}>메인</a>
            <a href="#assignments" onClick={(e) => { e.preventDefault(); goToAssignments(); }}>과제제출</a>
            <a href="#community" onClick={(e) => { e.preventDefault(); goToCommunity(); }}>커뮤니티</a>
            <a href="#mypage" onClick={(e) => { e.preventDefault(); goToMyPage(); }}>마이페이지</a>
            <img src="/profile.png" alt="프로필" className="profile" onClick={handleProfileClick} />
        </div>
    </div>
    );
}

export default Header;