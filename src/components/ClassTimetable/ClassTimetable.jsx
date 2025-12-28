import React, { useState } from 'react';
import { mockTimetable } from '../../mocks/mockTimetable';
import './ClassTimetable.css';

const ClassTimetable = () => {
  const [timetable] = useState(mockTimetable);

  return (
    <div className="timetable-container">
      <div className="timetable-header">
        <h2 className="timetable-title">
          {timetable.major} {timetable.grade}학년 {timetable.classNumber}반 시간표
        </h2>
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
        </div>
      </div>
    </div>
  );
};

export default ClassTimetable;
