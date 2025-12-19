import React, { useState } from 'react';
import { mockTimetable } from '../../../mocks/mockTimetable';
import './Timetable.css';

const Timetable = () => {
  const [timetable] = useState(mockTimetable);

  return (
    <div className="timetable-container">
      <h2 className="timetable-title">
        {timetable.major} {timetable.grade}학년 {timetable.classNumber}반 시간표
      </h2>
      
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

export default Timetable;
