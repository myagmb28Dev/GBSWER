import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ProfileCard from './ProfileCard/ProfileCard';
import ScheduleBox from './ScheduleBox/ScheduleBox';
import MealCard from './MealCard/MealCard';
import Timetable from './Timetable/Timetable';
import './MyPageBoard.css';

const MyPageBoard = () => {
  return (
    <div className="mypage-board">
      <Header />
      
      <div className="mypage-content">
        <div className="content-wrapper">
          <div className="section-a">
            <ProfileCard />
            <MealCard />
          </div>
          
          <div className="section-b">
            <div className="schedule-section">
              <ScheduleBox />
            </div>
            
            <div className="timetable-section">
              <Timetable />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MyPageBoard;