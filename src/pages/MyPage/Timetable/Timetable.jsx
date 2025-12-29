import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Timetable.css';
import { useAppContext } from '../../../App';

const Timetable = () => {
  const [timetable, setTimetable] = useState(null);

  const { profile, cachedTimetable, setCachedTimetable, timetableRefreshing, setTimetableRefreshing } = useAppContext();
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        if (!profile) return;
        const token = localStorage.getItem('accessToken');
        const major = profile.major || profile.department || profile.majorName || profile.dept || '';
        const grade = profile.grade || profile.schoolGrade || profile.year || '';
        const classNumber = profile.classNumber || profile.classNo || profile.class || profile.classroom || profile.room || '';
        if (!major || !grade || !classNumber) return;
        const now = new Date();
        const dateParam = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
        const params = `?date=${dateParam}&major=${encodeURIComponent(major)}&grade=${encodeURIComponent(grade)}&class=${encodeURIComponent(classNumber)}`;
        const key = `timetable:${params}`;

        // 캐시 사용
        if (cachedTimetable && cachedTimetable[key]) {
          const cached = cachedTimetable[key];
          if (Array.isArray(cached)) {
            const schedule = cached.map(day => (day.periods || []).map(p => p.subjectName || ''));
            const base = { major: profile.major || '', grade: profile.grade || '', classNumber: profile.classNumber || '', days: ['월','화','수','목','금'] };
            setTimetable({ ...base, schedule });
          } else if (cached && typeof cached === 'object') {
            setTimetable(cached);
          }
          return;
        }

        const url = `/api/timetable${params}`;
        console.log('Timetable 요청 URL:', url);
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data?.data ?? res.data;
        if (Array.isArray(data)) {
          const schedule = data.map(day => (day.periods || []).map(p => p.subjectName || ''));
          const base = { major: profile.major || '', grade: profile.grade || '', classNumber: profile.classNumber || '', days: ['월','화','수','목','금'] };
          setTimetable({ ...base, schedule });
          setCachedTimetable && setCachedTimetable(prev => ({ ...prev, [key]: data }));
        } else if (data && typeof data === 'object') {
          setTimetable(data);
          setCachedTimetable && setCachedTimetable(prev => ({ ...prev, [key]: data }));
        }
      } catch (err) {
        // GET이 404면 refresh-week 호출
        if (err.response && err.response.status === 404) {
          try {
            const now = new Date();
            const dateParam = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
            const major = profile.major || profile.department || profile.majorName || profile.dept || '';
            const grade = profile.grade || profile.schoolGrade || profile.year || '';
            const classNumber = profile.classNumber || profile.classNo || profile.class || profile.classroom || profile.room || '';
            const params = `?date=${dateParam}&major=${encodeURIComponent(major)}&grade=${encodeURIComponent(grade)}&class=${encodeURIComponent(classNumber)}`;
            const key = `timetable:${params}`;

            if (timetableRefreshing && timetableRefreshing[key]) {
              const waitForCache = () => new Promise(resolve => {
                const start = Date.now();
                const iv = setInterval(() => {
                  if (cachedTimetable && cachedTimetable[key]) { clearInterval(iv); resolve(cachedTimetable[key]); }
                  if (Date.now() - start > 5000) { clearInterval(iv); resolve(null); }
                }, 200);
              });
              const data = await waitForCache();
              if (Array.isArray(data)) {
                const schedule = data.map(day => (day.periods || []).map(p => p.subjectName || ''));
                setTimetable(prev => ({ ...prev, schedule }));
              } else if (data && typeof data === 'object') {
                setTimetable(prev => ({ ...prev, ...data }));
              }
              return;
            }

            setTimetableRefreshing && setTimetableRefreshing(prev => ({ ...prev, [key]: true }));
            console.log('Timetable refresh 요청 URL:', `/api/timetable/refresh-week${params}`);
            const token = localStorage.getItem('accessToken');
            const refreshRes = await axios.post(`/api/timetable/refresh-week${params}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            const data = refreshRes.data?.data ?? refreshRes.data;
              if (Array.isArray(data)) {
                const schedule = data.map(day => (day.periods || []).map(p => p.subjectName || ''));
                const base = { major: profile.major || '', grade: profile.grade || '', classNumber: profile.classNumber || '', days: ['월','화','수','목','금'] };
                setTimetable({ ...base, schedule });
                setCachedTimetable && setCachedTimetable(prev => ({ ...prev, [key]: data }));
              } else if (data && typeof data === 'object') {
                setTimetable(data);
                setCachedTimetable && setCachedTimetable(prev => ({ ...prev, [key]: data }));
              }
            setTimetableRefreshing && setTimetableRefreshing(prev => ({ ...prev, [key]: false }));
          } catch (refreshErr) {
            console.error('Timetable 강제 리프레시 실패:', refreshErr?.response?.data || refreshErr.message);
            setTimetable(null);
          }
        } else {
          console.error('Timetable 불러오기 실패:', err?.response?.data || err.message);
          setTimetable(null);
        }
      }
    };
    fetchTimetable();
  }, [profile]);
  if (!timetable) return <div className="timetable-container">시간표를 불러오는 중...</div>;

  // 자동 스케일 계산
  useEffect(() => {
    const compute = () => {
      const wrap = wrapperRef.current;
      const sched = timetable.schedule || [];
      if (!wrap || !Array.isArray(sched) || sched.length === 0) { setScale(1); return; }
      const maxPeriods = Math.max(...sched.map(d => Array.isArray(d) ? d.length : 0));
      const header = wrap.querySelector('.timetable-header');
      const available = wrap.clientHeight - (header ? header.offsetHeight : 80) - 20;
      const cellHeight = 60;
      const needed = maxPeriods * cellHeight;
      const s = Math.min(1, available / Math.max(needed, 1));
      setScale(Number.isFinite(s) ? s : 1);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [timetable]);

  const displayMajor = (timetable && (timetable.major)) || (profile && (profile.major || profile.department || profile.majorName || profile.dept)) || '';
  const displayGrade = (timetable && (timetable.grade)) || (profile && (profile.grade || profile.schoolGrade || profile.year)) || '';
  const displayClass = (timetable && (timetable.classNumber)) || (profile && (profile.classNumber || profile.classNo || profile.class || profile.classroom || profile.room)) || '';

  return (
    <div className="timetable-container">
      <h2 className="timetable-title">
        {displayMajor} {displayGrade}학년 {displayClass}반 시간표
      </h2>
      <div className="timetable-wrapper">
        <div className="timetable-grid">
          <div className="weekday-headers">
            {timetable.days.map((day, index) => (
              <div key={index} className="weekday-header">{day}</div>
            ))}
          </div>
          <div className="timetable-wrapper" ref={wrapperRef}>
            <div className="schedule-grid" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              {(() => {
                const sched = timetable.schedule || [];
                if (!Array.isArray(sched) || sched.length === 0) return <div />;
                const maxPeriods = Math.max(...sched.map(d => Array.isArray(d) ? d.length : 0));
                const rows = Array.from({ length: maxPeriods }, (_, p) => sched.map(dayArr => (Array.isArray(dayArr) ? (dayArr[p] || '') : '')));
                return rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="schedule-row">
                    {row.map((subject, colIndex) => (
                      <div key={colIndex} className="subject-cell">
                        {subject || ''}
                      </div>
                    ))}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
