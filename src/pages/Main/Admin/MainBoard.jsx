import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import ClassCreateButton from '../../../components/ClassCreateButton/ClassCreateButton';
import './MainBoard.css';

const MainBoard = () => {
  return (
    <div className="main-board">
      <Header />
      
      <div className="main-content">
        {/* 관리자용 메인 페이지 컨텐츠가 들어갈 예정 */}
        <div className="admin-welcome">
          <h2>관리자 대시보드</h2>
          <p>클래스를 생성하고 학생들을 관리하세요.</p>
        </div>
        
        {/* 클래스 생성 버튼 */}
        <div className="class-button-container">
          <ClassCreateButton userRole="admin" />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MainBoard;