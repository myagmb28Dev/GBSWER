import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAppContext } from '../../App';
import './ClassTimetable.css';

const ClassTimetable = () => {
  const [timetable, setTimetable] = useState({
    major: '',
    grade: 0,
    classNumber: 0,
    schedule: [],
    days: ['월','화','수','목','금']
  });
  const { cachedTimetable, setCachedTimetable, timetableRefreshing, setTimetableRefreshing, profile } = useAppContext();
  const wrapperRef = useRef(null);
  const scale = useAutoScale(wrapperRef, timetable.schedule ? (Array.isArray(timetable.schedule) ? Math.max(...timetable.schedule.map(d => Array.isArray(d) ? d.length : 0)) : 0) : 0);

  useEffect(() => {
    const fetchTimetable = async () => {
      const token = localStorage.getItem('accessToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      // 날짜 계산
      const now = new Date();
      const dateParam = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;

      // 프로필 준비 확인
      if (!profile) return;
      const major = profile.major || profile.department || profile.majorName || profile.dept || '';
      const grade = profile.grade || profile.schoolGrade || profile.year || '';
      const classNum = profile.classNumber || profile.classNo || profile.class || profile.classroom || profile.room || '';

      // 프로필 정보로 timetable 업데이트
      setTimetable(prev => ({
        ...prev,
        major,
        grade,
        classNumber: classNum
      }));

      const params = `?date=${dateParam}&major=${encodeURIComponent(major)}&grade=${encodeURIComponent(grade)}&class=${encodeURIComponent(classNum)}`;
      const key = `timetable:${params}`;

      try {
        // 캐시 사용
        if (cachedTimetable && cachedTimetable[key]) {
          const cached = cachedTimetable[key];
          if (Array.isArray(cached)) {
            // API 데이터가 [요일][교시] 구조라고 가정
            // 표시할 때는 [교시][요일] 구조로 변환
            const maxPeriods = Math.max(...cached.map(day => day.periods?.length || 0));
            const schedule = [];
            for (let period = 0; period < maxPeriods; period++) {
              const periodRow = [];
              for (let day = 0; day < cached.length; day++) {
                const subject = cached[day]?.periods?.[period]?.subjectName || '';
                periodRow.push(subject);
              }
              schedule.push(periodRow);
            }
            setTimetable(prev => ({
              ...prev,
              schedule,
              major: prev.major,
              grade: prev.grade,
              classNumber: prev.classNumber
            }));
          } else if (cached && typeof cached === 'object') {
            setTimetable(prev => ({
              ...prev,
              ...cached,
              major: prev.major,
              grade: prev.grade,
              classNumber: prev.classNumber
            }));
          }
          return;
        }

        console.log('ClassTimetable 요청 URL:', `/api/timetable${params}`);
        const res = await axios.get(`/api/timetable${params}`, config);
        const data = res.data?.data ?? res.data;
        console.log('시간표 API 응답:', data);

        if (Array.isArray(data)) {
          // API 데이터가 [요일][교시] 구조라고 가정
          // 표시할 때는 [교시][요일] 구조로 변환
          const maxPeriods = Math.max(...data.map(day => day.periods?.length || 0));
          const schedule = [];
          for (let period = 0; period < maxPeriods; period++) {
            const periodRow = [];
            for (let day = 0; day < data.length; day++) {
              const subject = data[day]?.periods?.[period]?.subjectName || '';
              periodRow.push(subject);
            }
            schedule.push(periodRow);
          }
          setTimetable(prev => ({
            ...prev,
            schedule,
            major: prev.major,
            grade: prev.grade,
            classNumber: prev.classNumber
          }));
          setCachedTimetable(prev => ({ ...prev, [key]: data }));
        } else if (data && typeof data === 'object') {
          setTimetable(prev => ({
            ...prev,
            ...data,
            major: prev.major,
            grade: prev.grade,
            classNumber: prev.classNumber
          }));
          setCachedTimetable(prev => ({ ...prev, [key]: data }));
        }
      } catch (err) {
        // GET이 404면 refresh-week 호출
        if (err.response && err.response.status === 404) {
          try {
            if (timetableRefreshing && timetableRefreshing[key]) {
              // 다른 컴포넌트가 리프레시 중이면 캐시가 채워질 때까지 대기
              const waitForCache = () => new Promise(resolve => {
                const start = Date.now();
                const iv = setInterval(() => {
                  if (cachedTimetable && cachedTimetable[key]) { clearInterval(iv); resolve(cachedTimetable[key]); }
                  if (Date.now() - start > 5000) { clearInterval(iv); resolve(null); }
                }, 200);
              });
              const data = await waitForCache();
              if (Array.isArray(data)) {
                const maxPeriods = Math.max(...data.map(day => day.periods?.length || 0));
                const schedule = [];
                for (let period = 0; period < maxPeriods; period++) {
                  const periodRow = [];
                  for (let day = 0; day < data.length; day++) {
                    const subject = data[day]?.periods?.[period]?.subjectName || '';
                    periodRow.push(subject);
                  }
                  schedule.push(periodRow);
                }
                setTimetable(prev => ({
                  ...prev,
                  schedule,
                  major: prev.major,
                  grade: prev.grade,
                  classNumber: prev.classNumber
                }));
              } else if (data && typeof data === 'object') {
                setTimetable(prev => ({
                  ...prev,
                  ...data,
                  major: prev.major,
                  grade: prev.grade,
                  classNumber: prev.classNumber
                }));
              }
              return;
            }

            setTimetableRefreshing(prev => ({ ...prev, [key]: true }));
            console.log('ClassTimetable refresh 요청 URL:', `/api/timetable/refresh-week${params}`);
            const refreshRes = await axios.post(`/api/timetable/refresh-week${params}`, {}, config);
            const data = refreshRes.data?.data ?? refreshRes.data;
            if (Array.isArray(data)) {
              const maxPeriods = Math.max(...data.map(day => day.periods?.length || 0));
              const schedule = [];
              for (let period = 0; period < maxPeriods; period++) {
                const periodRow = [];
                for (let day = 0; day < data.length; day++) {
                  const subject = data[day]?.periods?.[period]?.subjectName || '';
                  periodRow.push(subject);
                }
                schedule.push(periodRow);
              }
              setTimetable(prev => ({
                ...prev,
                schedule,
                major: prev.major,
                grade: prev.grade,
                classNumber: prev.classNumber
              }));
              setCachedTimetable(prev => ({ ...prev, [key]: data }));
            } else if (data && typeof data === 'object') {
              setTimetable(prev => ({
                ...prev,
                ...data,
                major: prev.major,
                grade: prev.grade,
                classNumber: prev.classNumber
              }));
              setCachedTimetable(prev => ({ ...prev, [key]: data }));
            }
            setTimetableRefreshing(prev => ({ ...prev, [key]: false }));
          } catch (refreshErr) {
            console.error('시간표 강제 리프레시 실패:', refreshErr?.response?.data || refreshErr.message);
          }
        } else {
          console.error('시간표 불러오기 실패:', err?.response?.data || err.message);
        }
      }
    };
    fetchTimetable();
  }, [profile, cachedTimetable, timetableRefreshing, setCachedTimetable, setTimetableRefreshing]);

  // title fallbacks: use profile if timetable doesn't include values yet
  const displayMajor = timetable.major || (profile && (profile.major || profile.department || profile.majorName || profile.dept)) || '';
  const displayGrade = timetable.grade || (profile && (profile.grade || profile.schoolGrade || profile.year)) || '';
  const displayClass = timetable.classNumber || (profile && (profile.classNumber || profile.classNo || profile.class || profile.classroom || profile.room)) || '';

  // eslint-disable-next-line no-unused-vars
  const maxPeriods = timetable && Array.isArray(timetable.schedule) && timetable.schedule.length > 0
    ? Math.max(...timetable.schedule.map(d => Array.isArray(d) ? d.length : 0))
    : 0;

  return (
    <div className="timetable-container">
          <div className="timetable-header">
        <h2 className="timetable-title">
          {displayMajor && displayGrade && displayClass ? `${displayMajor} ${displayGrade}학년 ${displayClass}반` : '시간표'} 시간표
        </h2>
      </div>
          <div className="timetable-wrapper" ref={wrapperRef}>
        <div className="timetable-grid">
          <div className="weekday-headers">
            {timetable.days.map((day, index) => (
              <div key={index} className="weekday-header">{day}</div>
            ))}
          </div>
          <div className="schedule-grid" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            {(timetable.schedule || []).map((row, rowIndex) => (
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

// scale 계산: wrapper 높이에 맞춰 축소
function useAutoScale(wrapperRef, maxPeriods) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const compute = () => {
      const wrap = wrapperRef.current;
      if (!wrap || !maxPeriods) { setScale(1); return; }
      const header = wrap.querySelector('.timetable-header');
      const available = wrap.clientHeight - (header ? header.offsetHeight : 80) - 20; // 여백
      const cellHeight = 60; // 예상 셀 높이
      const needed = maxPeriods * cellHeight;
      const s = Math.min(1, available / Math.max(needed, 1));
      setScale(Number.isFinite(s) ? s : 1);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [wrapperRef, maxPeriods]);
  return scale;
}

export default ClassTimetable;
