import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import NoticeCard from '../../../components/Notice/NoticeCard';
import Calendar from '../../../components/Calendar/Calendar';
import WeeklySchedule from '../../../components/Schedule/WeeklySchedule';
import './MainBoard.css';

const MainBoard = () => {
  return (
    <div className="main-board">
      <Header />
      <div className="content-container">
        <div className="left-section">
          <WeeklySchedule />
          <NoticeCard />
        </div>
        
        <Calendar />
      </div>
      <Footer />
    </div>
  );
};

export default MainBoard;