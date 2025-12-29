import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AdminClassModal from '../AdminClassModal/AdminClassModal';
import StudentClassModal from '../StudentClassModal/StudentClassModal';
import './ClassCreateButton.css';

const ClassCreateButton = ({ userRole = 'student', onCreateClass, onJoinClass }) => {
  const [showModal, setShowModal] = useState(false);

  const handleButtonClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleClassCreate = async (classData) => {
    if (onCreateClass) {
      await onCreateClass(classData);
    }
    setShowModal(false);
  };

  const handleClassJoin = async (code) => {
    if (onJoinClass) {
      await onJoinClass(code);
    }
    setShowModal(false);
  };

  return (
    <>
      <button className="class-create-button" onClick={handleButtonClick}>
        <Plus size={20} className="plus-icon" />
        {(userRole === 'admin' || userRole === 'teacher') && <span className="button-text">클래스룸 생성</span>}
        {userRole === 'student' && <span className="button-text">클래스룸 참여</span>}
      </button>

      {showModal && (userRole === 'admin' || userRole === 'teacher') && (
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