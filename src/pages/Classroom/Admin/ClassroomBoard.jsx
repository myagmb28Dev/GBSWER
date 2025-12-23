import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import ClassCreateButton from '../../../components/ClassCreateButton/ClassCreateButton';
import ClassCard from '../../../components/ClassCard/ClassCard';
import ClassDetailCard from '../../../components/ClassDetailCard/ClassDetailCard';
import { adminClasses } from '../../../mocks/mockClasses';
import './ClassroomBoard.css';

const ClassroomBoard = () => {
  const getCurrentDate = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  };

  const { year, month, day } = getCurrentDate();

  return (
    <div className="classroom-board">
      <Header />
      
      <div className="classroom-content">
        {/* 날짜 표시 */}
        <div className="date-display">
          <p className="year-text">{year}년</p>
          <h2 className="date-text">{month}월 {day}일</h2>
        </div>

        {/* 관리자 알림 */}
        <div className="admin-notice">
          <h3>관리자 클래스룸</h3>
          <p>클래스를 생성하고 학생들의 과제를 관리하세요.</p>
        </div>

        {/* 생성한 클래스 목록 */}
        {adminClasses.length > 0 ? (
          <div className="class-grid">
            {adminClasses.map((classData) => (
              <ClassCard
                key={classData.id}
                className={classData.className}
                teacherName={classData.teacherName}
                assignmentDeadline={classData.assignmentDeadline}
                onClick={() => console.log(`${classData.className} 관리 페이지로 이동`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-class-list">
            <p>아직 생성한 클래스가 없습니다.</p>
            <p>아래 버튼을 클릭하여 새로운 클래스를 생성해보세요!</p>
          </div>
        )}

        {/* 클래스 생성 버튼 */}
        <div className="class-button-container">
          <ClassCreateButton userRole="admin" />
        </div>

        {/* 새로운 클래스 상세 카드 테스트 */}
        <div className="class-detail-container">
          <ClassDetailCard
            className={adminClasses[0]?.className}
            teacherName={adminClasses[0]?.teacherName}
            classCode={adminClasses[0]?.classCode}
            participantCount={adminClasses[0]?.participantCount}
            onClick={() => console.log('관리자 클래스 상세 카드 클릭됨')}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ClassroomBoard;