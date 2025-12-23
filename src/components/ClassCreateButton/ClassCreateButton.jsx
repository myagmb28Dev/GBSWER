import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AdminClassModal from '../AdminClassModal/AdminClassModal';
import StudentClassModal from '../StudentClassModal/StudentClassModal';
import './ClassCreateButton.css';

const ClassCreateButton = ({ userRole = 'student' }) => {
  const [showModal, setShowModal] = useState(false);

  const handleButtonClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleClassCreate = (classData) => {
    console.log('클래스 생성:', classData);
    // 클래스 생성 로직 처리
    setShowModal(false);
  };

  const handleClassJoin = (code) => {
    console.log('클래스 참여:', code);
    // 클래스 참여 로직 처리
    setShowModal(false);
  };

  return (
    <>
      <button className="class-create-button" onClick={handleButtonClick}>
        <Plus size={20} className="plus-icon" />
      </button>

      {showModal && userRole === 'admin' && (
        <AdminClassModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onCreateClass={handleClassCreate}
        />
      )}

      {showModal && userRole === 'student' && (
        <StudentClassModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onJoinClass={handleClassJoin}
        />
      )}
    </>
  );
};

export default ClassCreateButton;