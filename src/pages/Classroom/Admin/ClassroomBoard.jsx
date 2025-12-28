import React, { useState } from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import ClassCreateButton from '../../../components/ClassCreateButton/ClassCreateButton';
import ClassCard from '../../../components/ClassCard/ClassCard';
import AdminClassDetailCard from '../../../components/ClassDetailCard/AdminClassDetailCard';
import AdminClassDetailSidebar from '../../../components/ClassDetailSidebar/AdminClassDetailSidebar';
import { adminClasses } from '../../../mocks/mockClasses';
import './ClassroomBoard.css';

const ClassroomBoard = () => {
  const [selectedClass, setSelectedClass] = useState(adminClasses[0] || null);
  const [selectedPost, setSelectedPost] = useState(null);
  const getCurrentDate = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  };

  const { year, month, day } = getCurrentDate();

  const handleClassClick = (classData) => {
    setSelectedClass(classData);
    setSelectedPost(null);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleCloseSidebar = () => {
    setSelectedPost(null);
  };

  return (
    <div className="classroom-board">
      <Header />
      
      <div className="classroom-main-content">
        {/* 왼쪽 섹션 (날짜 + 클래스 목록 + 버튼) */}
        <div className="classroom-left-section">
          {/* 날짜 표시 */}
          <div className="date-display">
            <p className="year-text">{year}년</p>
            <h2 className="date-text">{month}월 {day}일</h2>
          </div>

          {/* 생성한 클래스 목록 */}
          {adminClasses.length > 0 ? (
            <div className="class-grid">
              {adminClasses.map((classData) => (
                <ClassCard
                  key={classData.id}
                  className={classData.className}
                  teacherName={classData.teacherName}
                  posts={classData.posts}
                  onClick={() => handleClassClick(classData)}
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
        </div>

        {/* 클래스 상세 카드 */}
        <div className="class-detail-wrapper">
          {selectedClass ? (
            <AdminClassDetailCard
              className={selectedClass.className}
              teacherName={selectedClass.teacherName}
              classCode={selectedClass.classCode}
              participantCount={selectedClass.participantCount}
              participants={selectedClass.participants || []}
              posts={selectedClass.posts || []}
              onPostClick={handlePostClick}
            />
          ) : (
            <div className="no-class-selected">
              <p>클래스를 선택해주세요</p>
            </div>
          )}
        </div>

        {/* 상세 사이드바 */}
        <div className="sidebar-wrapper">
          <AdminClassDetailSidebar
            selectedPost={selectedPost}
            onClose={handleCloseSidebar}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ClassroomBoard;