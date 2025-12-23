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
          {/* Admin Notice */}
          <div className="admin-notice">
            <h3>관리자 마이페이지</h3>
            <p>관리자 권한으로 접속 중입니다.</p>
          </div>
          
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