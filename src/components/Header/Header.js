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
<<<<<<< HEAD
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
=======

    function goToClassroom() {
        setCurrentPage('classroom');
    }

    function handleProfileClick() {
        setShowProfileModal(true);
    }

return (
    <div className="header">
        <img src="/logo.png" alt="로고" className="logo" onClick={goToMain} />
        <div className="right">
            <a href="#main" onClick={(e) => { e.preventDefault(); goToMain(); }}>메인</a>
            <a href="#classroom" onClick={(e) => { e.preventDefault(); goToClassroom(); }}>클래스룸</a>
            <a href="#community" onClick={(e) => { e.preventDefault(); goToCommunity(); }}>커뮤니티</a>
            <a href="#mypage" onClick={(e) => { e.preventDefault(); goToMyPage(); }}>마이페이지</a>
            <img src="/profile.png" alt="프로필" className="profile" onClick={handleProfileClick} />
>>>>>>> 3abdeff (feat: enhance assignment page features)
        </div>
    );
}

export default Header;