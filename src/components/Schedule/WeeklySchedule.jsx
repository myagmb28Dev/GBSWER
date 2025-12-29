import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../App';
import axios from 'axios';
import ViewEventModal from '../Calendar/ViewEventModal';
import './WeeklySchedule.css';

const WeeklySchedule = () => {
  const { globalEvents, setGlobalEvents, cachedSchedules, setCachedSchedules, schedulesRefreshing, setSchedulesRefreshing } = useAppContext();
  const [schedules, setSchedules] = useState([]);
  const [serverSchedules, setServerSchedules] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 전역 일정과 로컬 일정을 합치기
  useEffect(() => {
    const fetchServerSchedules = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const key = `${year}-${month}`;
        // 캐시가 있고 undefined가 아니면 사용 (undefined는 무효화된 캐시)
        if (cachedSchedules && cachedSchedules[key] !== undefined) {
          console.log('📋 캐시된 데이터 사용');
          setServerSchedules(cachedSchedules[key]);
          return;
        }

        if (cachedSchedules && cachedSchedules[key] === undefined) {
          console.log('🔄 캐시 무효화됨, 최신 데이터 불러오기');
        }
        const res = await axios.get(`/api/schedule?year=${year}&month=${month}`, config);
        console.log('📥 학사일정 API 응답:', res.data);
        const scheduleData = res.data?.data || [];
        console.log('학사일정 데이터 개수:', scheduleData.length);
        if (scheduleData.length > 0) {
          console.log('첫 번째 일정 샘플:', scheduleData[0]);
        }
        setServerSchedules(scheduleData);
        setCachedSchedules(prev => ({ ...prev, [key]: scheduleData }));
      } catch (err) {
        if (err.response && err.response.status === 404) {
          try {
            const token = localStorage.getItem('accessToken');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            const key = `${year}-${month}`;
            if (schedulesRefreshing && schedulesRefreshing[key]) {
              const waitForCache = () => new Promise(resolve => {
                const start = Date.now();
                const iv = setInterval(() => {
                  if (cachedSchedules && cachedSchedules[key]) { clearInterval(iv); resolve(cachedSchedules[key]); }
                  if (Date.now() - start > 5000) { clearInterval(iv); resolve(null); }
                }, 200);
              });
              const data = await waitForCache();
              setServerSchedules(data || []);
              return;
            }

            setSchedulesRefreshing(prev => ({ ...prev, [key]: true }));
            console.log('🔄 학사일정 리프레시 시도:', `/api/schedule/refresh-month?year=${year}&month=${month}`);
            const refreshRes = await axios.post(`/api/schedule/refresh-month?year=${year}&month=${month}`, {}, config);
            console.log('리프레시 API 응답:', refreshRes.data);
            const data = refreshRes.data?.data || [];
            console.log('리프레시 후 일정 개수:', data.length);
            setServerSchedules(data);
            setCachedSchedules(prev => ({ ...prev, [key]: data }));
            setSchedulesRefreshing(prev => ({ ...prev, [key]: false }));
          } catch (refreshErr) {
            setServerSchedules([]);
          }
        } else {
          setServerSchedules([]);
        }
      }
    };
    fetchServerSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
    // 학사 일정만 필터링 (category가 '학교'인 일정)
    const schoolSchedules = serverSchedules.filter(schedule => schedule.category === '학교');
    // globalEvents 중에서도 학사 일정만 포함
    const schoolGlobalEvents = safeGlobalEvents.filter(event => event.category === '학교');
    // globalEvents를 우선으로 병합 (globalEvents의 데이터가 더 최신)
    const merged = [...schoolSchedules, ...schoolGlobalEvents];
    const deduped = merged.reduce((acc, ev) => {
      // 이미 존재하는 이벤트는 globalEvents의 최신 데이터로 덮어씀
      const existingIndex = acc.findIndex(e => e.id === ev.id);
      if (existingIndex >= 0) {
        // globalEvents에서 온 데이터면 덮어쓰기
        if (schoolGlobalEvents.some(ge => ge.id === ev.id)) {
          acc[existingIndex] = ev;
        }
        // serverSchedules에서 온 데이터는 무시 (이미 globalEvents에 있는 경우)
      } else {
        acc.push(ev);
      }
      return acc;
    }, []);
    console.log('📋 학사 일정 병합 결과 (globalEvents 우선):', {
      schoolSchedules: schoolSchedules.length,
      schoolGlobalEvents: schoolGlobalEvents.length,
      merged: merged.length,
      deduped: deduped.length
    });
    setSchedules(deduped);
  }, [globalEvents, serverSchedules]);

  // 이번주 일정 필터링 (D-day부터 7일까지)
  const getWeeklySchedules = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    console.log('📅 이번주 일정 필터링 시작');
    console.log('오늘 날짜:', today.toISOString().split('T')[0]);
    console.log('7일 후:', sevenDaysLater.toISOString().split('T')[0]);
    console.log('전체 일정 수:', schedules.length);

    const filtered = schedules.filter(schedule => {
      console.log('일정 필터링:', schedule.title, {
        showInSchedule: schedule.showInSchedule,
        endDate: schedule.endDate
      });

      const endDate = new Date(schedule.endDate);
      endDate.setHours(0, 0, 0, 0);

      const isInRange = endDate >= today && endDate <= sevenDaysLater;
      console.log('날짜 범위 체크:', {
        title: schedule.title,
        endDate: endDate.toISOString().split('T')[0],
        today: today.toISOString().split('T')[0],
        sevenDaysLater: sevenDaysLater.toISOString().split('T')[0],
        isInRange
      });

      return isInRange;
    }).sort((a, b) => {
      // 마감일 기준으로 빠른 순서대로 정렬
      const dateA = new Date(a.endDate);
      const dateB = new Date(b.endDate);
      return dateA - dateB;
    });

    console.log('필터링 결과:', filtered.length, '개의 일정');
    return filtered;
  };

  // D-Day 계산 함수
  const calculateDDay = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(endDate);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  const weeklySchedules = getWeeklySchedules();

  // 현재 날짜 정보
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    return { year, month, date };
  };

  const { year, month, date } = getCurrentDate();


  const handleEventClick = (schedule) => {
    setSelectedEvent(schedule);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      console.log('🗑️ 개인 일정 DB 삭제 시도:', eventId);
      await axios.delete(`/api/schedule/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ 개인 일정 DB 삭제 성공');

      // 전역 상태에서도 삭제
      const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
      setGlobalEvents(safeGlobalEvents.filter(s => s.id !== eventId));

      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error('❌ 개인 일정 DB 삭제 실패:', error.response?.data || error.message);
      alert('개인 일정 삭제에 실패했습니다.');
    }
  };

  const handleEditEvent = async (eventId, updatedData) => {
    console.log('🎯 WeeklySchedule handleEditEvent 시작');
    console.log('📊 이벤트 ID:', eventId);
    console.log('📝 전달받은 데이터:', updatedData);
    console.log('🎯 showInSchedule 값:', updatedData.showInSchedule, '(타입:', typeof updatedData.showInSchedule, ')');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      // DB에 개인 일정 수정 저장 (API 구조에 맞게)
      const updatePayload = {
        id: eventId,
        title: updatedData.title,
        startDate: updatedData.startDate,
        endDate: updatedData.endDate,
        memo: updatedData.memo || '',
        category: '개인',
        color: updatedData.color,
        showInSchedule: updatedData.showInSchedule !== undefined ? updatedData.showInSchedule : true
      };

      console.log('✏️ 개인 일정 DB 수정 시도:', eventId, updatePayload);
      console.log('📡 API 요청 URL:', `/api/schedule/${eventId}`);
      console.log('🔑 Authorization 헤더:', `Bearer ${token.substring(0, 20)}...`);

      const response = await axios.put(`/api/schedule/${eventId}`, updatePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ 개인 일정 DB 수정 성공, 응답:', response.data);
      console.log('🔄 응답 showInSchedule 값:', response.data?.showInSchedule);

      // 전역 상태에서도 수정 (UI 즉시 반영)
      const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
      const updatedEvent = {
        id: eventId,
        title: updatedData.title,
        startDate: updatedData.startDate,
        endDate: updatedData.endDate,
        memo: updatedData.memo || '',
        category: '개인',
        color: updatedData.color,
        showInSchedule: updatedData.showInSchedule !== undefined ? updatedData.showInSchedule : true
      };
      setGlobalEvents(safeGlobalEvents.map(s =>
        s.id === eventId
          ? updatedEvent
          : s
      ));

      console.log('🔄 전역 상태 업데이트 완료:', updatedEvent);
      console.log('📅 showInSchedule 필터링 확인 - 수정된 일정:', {
        id: eventId,
        showInSchedule: updatedEvent.showInSchedule,
        willBeFiltered: updatedEvent.showInSchedule === false
      });

      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error('❌ 개인 일정 DB 수정 실패:', error.response?.data || error.message);
      alert('개인 일정 수정에 실패했습니다.');
    }
  };

  return (
    <div className="weekly-schedule">
      {/* 날짜 섹션 */}
      <div className="date-section">
        <div className="year-text">{year}년</div>
        <div className="date-main">{month}월 {date}일</div>
        <img 
          src="/meister-school.png" 
          alt="마이스터 캐릭터" 
          className="meister-character"
        />
      </div>

      {/* 일정 박스 */}
      <div className="schedule-box">
        <div className="schedule-box-header">
          <span className="schedule-title">이번주 학사 일정</span>
        </div>
        
        <div className="schedule-content">
          {weeklySchedules.length > 0 ? (
            weeklySchedules.map(schedule => (
              <div 
                key={schedule.id} 
                className="schedule-item"
                onClick={() => handleEventClick(schedule)}
              >
                <div 
                  className="schedule-dot" 
                  style={{ backgroundColor: schedule.color }}
                />
                <span className="schedule-text">{schedule.title}</span>
                <span className="schedule-dday">{calculateDDay(schedule.endDate)}</span>
              </div>
            ))
          ) : (
            <div className="empty-schedule-text">
              학사일정이 없습니다.
            </div>
          )}
        </div>
      </div>

      {selectedEvent && (
        <ViewEventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
          onEdit={handleEditEvent}
        />
      )}
    </div>
  );
};

export default WeeklySchedule;