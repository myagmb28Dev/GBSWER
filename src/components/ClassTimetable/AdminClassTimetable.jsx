import React, { useState } from 'react';
import { Edit2, X, Check } from 'lucide-react';
import { mockTimetable } from '../../mocks/mockTimetable';
import './ClassTimetable.css';

const AdminClassTimetable = () => {
  const [timetable, setTimetable] = useState(mockTimetable);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState(timetable.schedule);
<<<<<<< HEAD

  const handleEditStart = () => {
    setEditedSchedule(timetable.schedule.map(row => [...row]));
    setIsEditMode(true);
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
=======
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditStart = () => {
    setEditedSchedule(timetable.schedule.map(row => [...row]));
    setIsModalOpen(true);
  };

  const handleEditCancel = () => {
    setIsModalOpen(false);
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
  };

  const handleEditSave = () => {
    setTimetable({
      ...timetable,
      schedule: editedSchedule
    });
<<<<<<< HEAD
    setIsEditMode(false);
=======
    setIsModalOpen(false);
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newSchedule = editedSchedule.map(row => [...row]);
    newSchedule[rowIndex][colIndex] = value;
    setEditedSchedule(newSchedule);
  };

  return (
<<<<<<< HEAD
    <div className="timetable-container">
      <div className="timetable-header">
        <h2 className="timetable-title">
          {timetable.major} {timetable.grade}학년 {timetable.classNumber}반 시간표
        </h2>
        {!isEditMode && (
          <button 
            className="edit-button"
            onClick={handleEditStart}
            title="시간표 수정"
          >
            <Edit2 size={18} />
          </button>
        )}
      </div>

      <div className="timetable-wrapper">
        <div className="timetable-grid">
          <div className="weekday-headers">
            {timetable.days.map((day, index) => (
              <div key={index} className="weekday-header">{day}</div>
            ))}
          </div>
          <div className="schedule-grid">
            {(isEditMode ? editedSchedule : timetable.schedule).map((row, rowIndex) => (
              <div key={rowIndex} className="schedule-row">
                {row.map((subject, colIndex) => (
                  <div key={colIndex} className="subject-cell">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={subject || ''}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className="subject-input"
                        placeholder="과목명"
                      />
                    ) : (
                      subject || ''
                    )}
                  </div>
                ))}
              </div>
            ))}
=======
    <>
      <div className="timetable-container">
        <div className="timetable-header">
          <h2 className="timetable-title">
            {timetable.major} {timetable.grade}학년 {timetable.classNumber}반 시간표
          </h2>
          <div className="header-actions">
            <button 
              className="edit-button"
              onClick={handleEditStart}
              title="시간표 수정"
            >
              <Edit2 size={18} />
            </button>
          </div>
        </div>

        <div className="timetable-wrapper">
          <div className="timetable-grid">
            <div className="weekday-headers">
              {timetable.days.map((day, index) => (
                <div key={index} className="weekday-header">{day}</div>
              ))}
            </div>
            <div className="schedule-grid">
              {timetable.schedule.map((row, rowIndex) => (
                <div key={rowIndex} className="schedule-row">
                  {row.map((subject, colIndex) => (
                    <div key={colIndex} className="subject-cell">
                      {subject || ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {isEditMode && (
        <div className="edit-actions">
          <button 
            className="btn-cancel"
            onClick={handleEditCancel}
          >
            <X size={16} />
            취소
          </button>
          <button 
            className="btn-save"
            onClick={handleEditSave}
          >
            <Check size={16} />
            저장
          </button>
        </div>
      )}
    </div>
=======
      {/* 수정 모달 */}
      {isModalOpen && (
        <div className="timetable-modal-overlay" onClick={handleEditCancel}>
          <div className="timetable-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">시간표 수정</h3>
              <button className="modal-close" onClick={handleEditCancel}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="timetable-grid">
                <div className="weekday-headers">
                  {timetable.days.map((day, index) => (
                    <div key={index} className="weekday-header">{day}</div>
                  ))}
                </div>
                <div className="schedule-grid">
                  {editedSchedule.map((row, rowIndex) => (
                    <div key={rowIndex} className="schedule-row">
                      {row.map((subject, colIndex) => (
                        <div key={colIndex} className="subject-cell">
                          <input
                            type="text"
                            value={subject || ''}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            className="subject-input"
                            placeholder="과목명"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={handleEditCancel}
              >
                취소
              </button>
              <button 
                className="btn-save"
                onClick={handleEditSave}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
  );
};

export default AdminClassTimetable;
