import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../App';
import { mockSchedule } from '../../mocks/mockSchedule';
import AddEventModal from '../Calendar/AddEventModal';
import ViewEventModal from '../Calendar/ViewEventModal';
import './WeeklySchedule.css';

const WeeklySchedule = () => {
  const { globalEvents, setGlobalEvents } = useAppContext();
  const [schedules, setSchedules] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 전역 일정과 로컬 일정을 합치기
  useEffect(() => {
    const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
    const combinedSchedules = [...mockSchedule, ...safeGlobalEvents];
    setSchedules(combinedSchedules);
  }, [globalEvents]);

  // 이번주 일정 필터링 (D-day부터 7일까지)
  const getWeeklySchedules = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);
    
    return schedules.filter(schedule => {
      // 일정표에 표시 안함으로 설정된 일정 제외
      if (schedule.showInSchedule === false) {
        return false;
      }
      
      const endDate = new Date(schedule.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      // D-day부터 7일 이내의 일정만 포함
      return endDate >= today && endDate <= sevenDaysLater;
    }).sort((a, b) => {
      // 마감일 기준으로 빠른 순서대로 정렬
      const dateA = new Date(a.endDate);
      const dateB = new Date(b.endDate);
      return dateA - dateB;
    });
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

  const handleAddSchedule = () => {
    setShowAddModal(true);
  };

  const handleAddEvent = (eventData) => {
    const newEvent = {
      id: Date.now(),
      title: eventData.title,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      memo: eventData.memo,
      color: eventData.color,
      category: '개인',
      showInSchedule: eventData.showInSchedule !== undefined ? eventData.showInSchedule : true
    };
    
    // 전역 상태에 추가
    const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
    setGlobalEvents([...safeGlobalEvents, newEvent]);
    setShowAddModal(false);
  };

  const handleEventClick = (schedule) => {
    setSelectedEvent(schedule);
  };

  const handleDeleteEvent = (eventId) => {
    // 전역 상태에서도 삭제
    const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
    setGlobalEvents(safeGlobalEvents.filter(s => s.id !== eventId));
  };

  const handleEditEvent = (eventId, updatedData) => {
    // 전역 상태에서도 수정
    const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
    setGlobalEvents(safeGlobalEvents.map(s => 
      s.id === eventId 
        ? { ...s, ...updatedData }
        : s
    ));
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
          <button className="add-schedule-btn" onClick={handleAddSchedule}>
            +
          </button>
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

      {showAddModal && (
        <AddEventModal
          selectedDate={new Date()}
          onClose={() => setShowAddModal(false)}
          onAddEvent={handleAddEvent}
        />
      )}

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