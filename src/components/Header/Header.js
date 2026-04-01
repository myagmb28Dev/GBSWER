import './Header.css';
<<<<<<< HEAD
import React, { useState } from 'react';
import { useAppContext } from '../../App';

function Header() {
    const { setCurrentPage, handleLogout, userRole, profile } = useAppContext();
    const [showLogoutMenu, setShowLogoutMenu] = useState(false);
=======
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../App';

function Header() {
    const navigate = useNavigate();
    const { handleLogout, userRole, profile, setShowProfileModal } = useAppContext();
    const [showProfileBox, setShowProfileBox] = useState(false);
    const profileBoxRef = useRef(null);
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)

    function goToMain() {
        navigate('/main');
    }
    function goToCommunity() {
        navigate('/community');
    }
    function goToMyPage() {
        navigate('/mypage');
    }

    function goToClassroom() {
<<<<<<< HEAD
        setCurrentPage('classroom');
    }

    const handleProfileClick = () => {
        setShowLogoutMenu(!showLogoutMenu);
    };

    const handleLogoutClick = () => {
        setShowLogoutMenu(false);
        handleLogout();
    };

=======
        navigate('/classroom');
    }

    const handleProfileClick = () => {
        setShowProfileBox(!showProfileBox);
    };

    const handleLogoutClick = () => {
        setShowProfileBox(false);
        handleLogout();
    };

    const handleEditProfile = () => {
        setShowProfileBox(false);
        setShowProfileModal(true);
    };

    // 프로필 박스 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileBoxRef.current && !profileBoxRef.current.contains(event.target)) {
                setShowProfileBox(false);
            }
        };

        if (showProfileBox) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileBox]);

>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
    return (
        <div className="header">
            <img src="/logo.png" alt="로고" className="logo" onClick={goToMain} />
            <div className="right">
                <a href="#main" onClick={(e) => { e.preventDefault(); goToMain(); }}>메인</a>
                <a href="#community" onClick={(e) => { e.preventDefault(); goToCommunity(); }}>커뮤니티</a>
                <a href="#classroom" onClick={(e) => { e.preventDefault(); goToClassroom(); }}>클래스룸</a>
                <a href="#mypage" onClick={(e) => { e.preventDefault(); goToMyPage(); }}>마이페이지</a>
<<<<<<< HEAD
                <div className="profile-menu">
=======
                <div className="profile-menu" ref={profileBoxRef}>
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
                    <img 
                        src={profile && profile.profileImage ? profile.profileImage : '/profile.png'}
                        alt="프로필"
                        className="profile"
                        onClick={handleProfileClick}
                    />
<<<<<<< HEAD
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
=======
                    {showProfileBox && (
                        <div className="profile-info-box">
                            <div className="profile-header">
                                <img 
                                    src={profile?.profileImage || '/profile.png'} 
                                    alt="프로필 사진" 
                                    className="profile-image"
                                />
                                <div className="profile-details">
                                    <div className="profile-name">{profile?.name || '사용자'}</div>
                                    <div className="profile-id">{profile?.userId || '아이디'}</div>
                                </div>
                            </div>
                            <div className="profile-buttons">
                                <button 
                                    className="edit-profile-btn"
                                    onClick={handleEditProfile}
                                >
                                    정보 수정하기
                                </button>
                                <button 
                                    className="logout-btn"
                                    onClick={handleLogoutClick}
                                >
                                    로그아웃
                                </button>
                            </div>
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Header;