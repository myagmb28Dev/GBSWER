import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import UserProfileCard from '../../../components/UserProfileCard/UserProfileCard';
import PersonalScheduleBox from '../../../components/PersonalScheduleBox/PersonalScheduleBox';
import SchoolMealCard from '../../../components/SchoolMealCard/SchoolMealCard';
import ClassTimetable from '../../../components/ClassTimetable/ClassTimetable';
import './MyPageBoard.css';

const MyPageBoard = () => {
  return (
    <div className="mypage-board">
      <Header />
      
      <div className="mypage-content">
        <div className="content-wrapper">
          <div className="section-a">
            <UserProfileCard />
            <SchoolMealCard />
          </div>
          
          <div className="section-b">
            <div className="schedule-section">
              <PersonalScheduleBox />
            </div>
            
            <div className="timetable-section">
              <ClassTimetable />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MyPageBoard;