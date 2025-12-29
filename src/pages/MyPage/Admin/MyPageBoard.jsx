import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import UserProfileCard from '../../../components/UserProfileCard/UserProfileCard';
import PersonalScheduleBox from '../../../components/PersonalScheduleBox/PersonalScheduleBox';
import SchoolMealCard from '../../../components/SchoolMealCard/SchoolMealCard';
import AdminClassTimetable from '../../../components/ClassTimetable/AdminClassTimetable';
import StudentManagement from '../StudentManagement';
import UserManagement from '../UserManagement';
import CommunityManagement from './CommunityManagement';
import ScheduleManagement from './ScheduleManagement';
import SystemMonitoring from './SystemMonitoring';
import './MyPageBoard.css';

const MyPageBoard = ({ userRole }) => {
  return (
    <div className="mypage-board">
      <Header />
      
      <div className="mypage-content">
        <div className="content-wrapper">
          {/* Role-based Notice */}
          <div className="admin-notice">
            <h3>{userRole === 'admin' ? '관리자' : '선생님'} 마이페이지</h3>
            <p>{userRole === 'admin' ? '관리자' : '선생님'} 권한으로 접속 중입니다.</p>
          </div>

          {/* Student Management - 선생님/관리자 공용 */}
          <StudentManagement />

          {/* User Management - 관리자 전용 */}
          {userRole === 'admin' && <UserManagement />}

          {/* Community Management - 관리자 전용 */}
          {userRole === 'admin' && <CommunityManagement />}

          {/* Schedule Management - 관리자 전용 */}
          {userRole === 'admin' && <ScheduleManagement />}

          {/* System Monitoring - 관리자 전용 */}
          {userRole === 'admin' && <SystemMonitoring />}

          <div className="section-a">
            <UserProfileCard />
            <SchoolMealCard />
          </div>
          
          <div className="section-b">
            <div className="schedule-section">
              <PersonalScheduleBox />
            </div>
            
            <div className="timetable-section">
              <AdminClassTimetable userRole={userRole} />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MyPageBoard;