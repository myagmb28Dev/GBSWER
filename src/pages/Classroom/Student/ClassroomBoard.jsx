import React, { useState } from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import ClassCreateButton from '../../../components/ClassCreateButton/ClassCreateButton';
import ClassCard from '../../../components/ClassCard/ClassCard';
import ClassDetailCard from '../../../components/ClassDetailCard/ClassDetailCard';
import ClassDetailSidebar from '../../../components/ClassDetailSidebar/ClassDetailSidebar';
import { studentClasses } from '../../../mocks/mockClasses';
import './ClassroomBoard.css';

const ClassroomBoard = () => {
  const [selectedClass, setSelectedClass] = useState(studentClasses[0] || null);
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
    setSelectedPost(null); // 클래스 변경 시 선택된 게시물 초기화
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

          {/* 참여한 클래스 목록 */}
          {studentClasses.length > 0 ? (
            <div className="class-grid">
              {studentClasses.map((classData) => (
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
              <p>아직 참여한 클래스가 없습니다.</p>
              <p>아래 버튼을 클릭하여 클래스에 참여해보세요!</p>
            </div>
          )}

          {/* 클래스 참여 버튼 */}
          <div className="class-button-container">
            <ClassCreateButton userRole="student" />
          </div>
        </div>

        {/* 클래스 상세 카드 */}
        <div className="class-detail-wrapper">
          {selectedClass ? (
            <ClassDetailCard
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

        {/* 새로운 상세 사이드바 */}
        <div className="sidebar-wrapper">
          <ClassDetailSidebar
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