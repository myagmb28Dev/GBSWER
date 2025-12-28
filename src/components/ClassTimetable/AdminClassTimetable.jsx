import React, { useState } from 'react';
import { Edit2, X, Check } from 'lucide-react';
import { mockTimetable } from '../../mocks/mockTimetable';
import './ClassTimetable.css';

const AdminClassTimetable = () => {
  const [timetable, setTimetable] = useState(mockTimetable);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState(timetable.schedule);

  const handleEditStart = () => {
    setEditedSchedule(timetable.schedule.map(row => [...row]));
    setIsEditMode(true);
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
  };

  const handleEditSave = () => {
    setTimetable({
      ...timetable,
      schedule: editedSchedule
    });
    setIsEditMode(false);
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newSchedule = editedSchedule.map(row => [...row]);
    newSchedule[rowIndex][colIndex] = value;
    setEditedSchedule(newSchedule);
  };

  return (
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
          </div>
        </div>
      </div>

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
  );
};

export default AdminClassTimetable;
