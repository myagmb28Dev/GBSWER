<<<<<<< HEAD:src/pages/MyPage/Timetable/Timetable.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Timetable.css';

const Timetable = () => {
  const [timetable, setTimetable] = useState(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        // major, grade, classNumber는 실제 로그인/프로필 정보에서 가져와야 함 (예시: 인공지능소프트웨어과, 2, 3)
        const major = '인공지능소프트웨어과';
        const grade = 2;
        const classNumber = 3;
        const res = await axios.get(`/api/timetable?major=${encodeURIComponent(major)}&grade=${grade}&classNumber=${classNumber}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTimetable(res.data.data);
      } catch (err) {
        setTimetable(null);
      }
    };
    fetchTimetable();
  }, []);

  if (!timetable) return <div className="timetable-container">시간표를 불러오는 중...</div>;
=======
import React, { useState } from 'react';
import { mockTimetable } from '../../mocks/mockTimetable';
import './ClassTimetable.css';

const ClassTimetable = () => {
  const [timetable] = useState(mockTimetable);
>>>>>>> 3abdeff (feat: enhance assignment page features):src/components/ClassTimetable/ClassTimetable.jsx

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

export default ClassTimetable;