import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import NoticeCard from '../../components/Notice/NoticeCard';
import Calendar from '../../components/Calendar/Calendar';
import './MainBoard.css';

const MainBoard = () => {
  return (
    <div className="main-board">
      <Header />
      <div className="content-container">
        <div className="notice-section">
          <h2 className="section-title">오늘의 공지사항</h2>
          <NoticeCard />
        </div>
        
        <Calendar />
      </div>
      <Footer />
    </div>
  );
};

export default MainBoard;