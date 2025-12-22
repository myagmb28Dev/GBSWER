import './Header.css';
import React from 'react';
import { useAppContext } from '../../App';

function Header() {
    const { setCurrentPage } = useAppContext();

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

    return (
        <div className="header">
            <img src="/logo.png" alt="로고" className="logo" onClick={goToMain} />
            <div className="right">
                <a href="#main" onClick={(e) => { e.preventDefault(); goToMain(); }}>메인</a>
                <a href="#assignments" onClick={(e) => { e.preventDefault(); goToAssignments(); }}>과제제출</a>
                <a href="#community" onClick={(e) => { e.preventDefault(); goToCommunity(); }}>커뮤니티</a>
                <a href="#mypage" onClick={(e) => { e.preventDefault(); goToMyPage(); }}>마이페이지</a>
                <img src="/profile.png" alt="프로필" className="profile" onClick={goToMyPage} />
            </div>
        </div>
    );
}

export default Header;