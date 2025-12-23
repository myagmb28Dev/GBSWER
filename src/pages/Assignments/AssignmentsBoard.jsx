import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './AssignmentsBoard.css';

const AssignmentsBoard = () => {
  return (
    <div className="assignments-board">
      <Header />
      
      <div className="assignments-content">
        {/* 여기에 과제 제출 관련 컨텐츠가 들어갈 예정 */}
      </div>
      
      <Footer />
    </div>
  );
};

export default AssignmentsBoard;