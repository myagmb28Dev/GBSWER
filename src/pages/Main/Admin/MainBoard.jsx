import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import ClassCreateButton from '../../../components/ClassCreateButton/ClassCreateButton';
import Calendar from '../../../components/Calendar/Calendar';
import NoticeCard from '../../../components/Notice/NoticeCard';
<<<<<<< HEAD
=======
import WeeklySchedule from '../../../components/Schedule/WeeklySchedule';
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
import './MainBoard.css';

const MainBoard = () => {
  return (
    <div className="main-board">
      <Header />
<<<<<<< HEAD
      
      <div className="main-content">
        <div className="left-section">
=======
      <div className="content-container">
        <div className="left-section">
          <WeeklySchedule />
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
          <NoticeCard />
        </div>
        
        <Calendar />
<<<<<<< HEAD
      </div>
      
      {/* 클래스 생성 버튼 */}
      <div className="class-button-container">
        <ClassCreateButton userRole="admin" />
=======
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
      </div>
      
      <Footer />
    </div>
  );
};

export default MainBoard;