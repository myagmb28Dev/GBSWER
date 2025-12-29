import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import Calendar from '../../../components/Calendar/Calendar';
import NoticeCard from '../../../components/Notice/NoticeCard';
import './MainBoard.css';

const MainBoard = () => {
  return (
    <div className="main-board">
      <Header />
      
      <div className="main-content">
        <div className="left-section">
          <NoticeCard />
        </div>
        
        <Calendar />
      </div>
      
      
      <Footer />
    </div>
  );
};

export default MainBoard;