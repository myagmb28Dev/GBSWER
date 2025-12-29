import React, { useState, useEffect } from 'react';
import { Edit2, X, Check } from 'lucide-react';
import axios from 'axios';
import { useAppContext } from '../../App';
import './ClassTimetable.css';

const AdminClassTimetable = ({ userRole }) => {
  const [timetable, setTimetable] = useState({
    major: '정보',
    grade: 1,
    classNumber: 1,
    schedule: [],
    days: ['월','화','수','목','금']
  });
  const { cachedTimetable, setCachedTimetable, timetableRefreshing, setTimetableRefreshing, profile } = useAppContext();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState(timetable.schedule);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const now = new Date();
        const dateParam = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
        if (!profile) return;
        console.log('AdminClassTimetable profile:', profile);
        const major = profile.major || profile.department || profile.majorName || profile.dept || '정보';
        const grade = profile.grade || profile.schoolGrade || profile.year || 1;
        const classNum = profile.classNumber || profile.classNo || profile.class || profile.classroom || profile.room || 1;

        console.log('AdminClassTimetable extracted:', { major, grade, classNum });

        // 프로필 정보로 timetable 업데이트
        setTimetable(prev => ({
          ...prev,
          major,
          grade,
          classNumber: classNum
        }));
        let params = `?date=${dateParam}`;
        if (major) params += `&major=${encodeURIComponent(major)}`;
        if (grade) params += `&grade=${encodeURIComponent(grade)}`;
        if (classNum) params += `&class=${encodeURIComponent(classNum)}`;
        const key = `timetable:${params}`;
        if (cachedTimetable && cachedTimetable[key]) {
          const data = cachedTimetable[key];
          if (Array.isArray(data)) {
            const schedule = data.map(day => (day.periods || []).map(p => p.subjectName || ''));
            setTimetable(prev => ({
              ...prev,
              schedule,
              major: prev.major,
              grade: prev.grade,
              classNumber: prev.classNumber
            }));
            setEditedSchedule(schedule);
          } else {
            setTimetable(prev => ({
              ...prev,
              ...data,
              major: prev.major,
              grade: prev.grade,
              classNumber: prev.classNumber
            }));
            setEditedSchedule(data.schedule || []);
          }
          return;
        }
        console.log('AdminClassTimetable 요청 URL:', `/api/timetable${params}`);
        const res = await axios.get(`/api/timetable${params}`, config);
        const data = res.data?.data ?? res.data;
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
          setEditedSchedule(schedule);
        } else {
          setTimetable(prev => ({
            ...prev,
            ...data,
            major: prev.major,
            grade: prev.grade,
            classNumber: prev.classNumber
          }));
          setEditedSchedule(data.schedule || []);
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          try {
            const token = localStorage.getItem('accessToken');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const now = new Date();
            const dateParam = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
            if (!profile) {
              console.error('프로필이 준비되지 않아 시간표 리프레시를 수행하지 않습니다.');
              return;
            }
            const major = profile.major || profile.department || profile.majorName || profile.dept || '';
            const grade = profile.grade || profile.schoolGrade || profile.year || '';
            const classNum = profile.classNumber || profile.classNo || profile.class || profile.classroom || profile.room || '';
            if (!major || !grade || !classNum) {
              console.error('시간표 리프레시에 필요한 major/grade/class 정보가 부족합니다. 리프레시를 건너뜁니다.');
              return;
            }
            const params = `?date=${dateParam}&major=${encodeURIComponent(major)}&grade=${encodeURIComponent(grade)}&class=${encodeURIComponent(classNum)}`;
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
                setEditedSchedule(schedule);
              } else if (data) {
                setTimetable(prev => ({
                  ...prev,
                  ...data,
                  major: prev.major,
                  grade: prev.grade,
                  classNumber: prev.classNumber
                }));
                setEditedSchedule(data.schedule || []);
              }
              return;
            }

            setTimetableRefreshing(prev => ({ ...prev, [key]: true }));
            console.log('AdminClassTimetable refresh 요청 URL:', `/api/timetable/refresh-week${params}`);
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
              setEditedSchedule(schedule);
              setCachedTimetable(prev => ({ ...prev, [key]: data }));
            } else if (data) {
              setTimetable(prev => ({
                ...prev,
                ...data,
                major: prev.major,
                grade: prev.grade,
                classNumber: prev.classNumber
              }));
              setEditedSchedule(data.schedule || []);
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
    // re-run when profile or cache/refresh flags change
  }, [profile, cachedTimetable, timetableRefreshing, setCachedTimetable, setTimetableRefreshing]);

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
          {timetable.major || '정보'} {timetable.grade || 1}학년 {timetable.classNumber || 1}반 시간표
        </h2>
        {!isEditMode && userRole === 'admin' && (
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
