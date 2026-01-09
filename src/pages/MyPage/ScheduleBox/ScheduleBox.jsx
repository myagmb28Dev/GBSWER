import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useAppContext } from '../../../App';
import AddEventModal from '../../../components/Calendar/AddEventModal';
import ViewEventModal from '../../../components/Calendar/ViewEventModal';
import './ScheduleBox.css';

const ScheduleBox = () => {
  const { globalEvents, setGlobalEvents, cachedSchedules, setCachedSchedules } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);


  // 전역 상태에서 개인 일정만 필터링
  const getFilteredSchedules = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 전역 상태에서 개인 일정만 가져옴
    const personalSchedules = Array.isArray(globalEvents) ? globalEvents.filter(s => s.category === '개인') : [];

    return personalSchedules.filter(schedule => {
      // 일정표에 표시 안함으로 설정된 일정 제외
      if (schedule.showInSchedule === false) {
        return false;
      }

      const endDate = new Date(schedule.endDate);
      endDate.setHours(0, 0, 0, 0);

      // 지난 일정은 제외
      if (endDate < today) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // 마감일 기준으로 빠른 순서대로 정렬
      const dateA = new Date(a.endDate);
      const dateB = new Date(b.endDate);
      return dateA - dateB;
    });
  };

  const personalSchedules = getFilteredSchedules();
  const schoolSchedules = []; // 마이페이지에서는 학교 일정 표시하지 않음
  
  const itemsPerPage = 3; // 각 카테고리당 3개씩
  const totalPersonalPages = Math.ceil(personalSchedules.length / itemsPerPage);
  const totalSchoolPages = Math.ceil(schoolSchedules.length / itemsPerPage);
  const maxPages = Math.max(totalPersonalPages, totalSchoolPages);
  
  const currentPersonalSchedules = personalSchedules.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const currentSchoolSchedules = schoolSchedules.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleAddSchedule = () => {
    setShowAddModal(true);
  };

  const handleAddEvent = async (eventData) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return;
      }

      // DB에 개인 일정 저장 (API 구조에 맞게)
      const eventPayload = {
        title: eventData.title,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        memo: eventData.memo || '',
        category: '개인',
        color: eventData.color,
        showInSchedule: eventData.showInSchedule !== undefined ? eventData.showInSchedule : true
      };

      const response = await axiosInstance.post('/api/schedule/add', eventPayload);

      // 전역 상태에 추가 (DB에서 저장된 ID 사용)
      const newEvent = {
        id: response.data?.data?.id || Date.now(),
        ...eventPayload
      };

      const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
      setGlobalEvents([...safeGlobalEvents, newEvent]);

      console.log('✅ 마이페이지 일정 추가 성공, 새로고침 실행');
      setTimeout(() => {
        window.location.reload();
      }, 100);

      setShowAddModal(false);
    } catch (error) {
      console.error('마이페이지 일정 추가 실패:', error);
      setShowAddModal(false);
    }
  };

  const calculateDaysLeft = (endDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(endDateStr);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysLeftText = (schedule) => {
    const daysLeft = calculateDaysLeft(schedule.endDate);
    if (daysLeft === 0) return 'D-day';
    if (daysLeft > 0) return `D-${daysLeft}`;
    return `D+${Math.abs(daysLeft)}`;
  };

  const handleEventClick = (schedule) => {
    console.log('👆 마이페이지 일정 클릭:', schedule.id, schedule.title);
    setSelectedEvent(schedule);
    console.log('📋 마이페이지 selectedEvent 설정됨:', schedule.id);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return;
      }

      await axiosInstance.delete(`/api/schedule/${eventId}`);

      // 전역 상태에서 삭제
      const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
      setGlobalEvents(safeGlobalEvents.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('마이페이지 일정 삭제 실패:', error);
    }
  };

  const handleEditEvent = async (eventId, updatedData) => {
    console.log('🎯 마이페이지 handleEditEvent 시작');
    console.log('📊 이벤트 ID:', eventId);
    console.log('📝 전달받은 데이터:', updatedData);
    console.log('🎯 showInSchedule 값:', updatedData.showInSchedule, '(타입:', typeof updatedData.showInSchedule, ')');

    try {
      const token = localStorage.getItem('accessToken');
      console.log('🔑 마이페이지 토큰 확인:', token ? `Bearer ${token.substring(0, 20)}...` : '토큰 없음');

      if (!token) {
        console.log('❌ 토큰 없음 - 수정 취소');
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

      console.log('✏️ 마이페이지 일정 DB 수정 시도:', eventId, updatePayload);
      console.log('📡 API 요청 URL:', `/api/schedule/${eventId}`);
      console.log('🔑 Authorization 헤더:', `Bearer ${token.substring(0, 20)}...`);
      console.log('📦 요청 페이로드:', JSON.stringify(updatePayload, null, 2));

      const response = await axiosInstance.put(`/api/schedule/${eventId}`, updatePayload);

      console.log('✅ 마이페이지 일정 수정 성공, 응답:', response.data);
      console.log('🔄 응답 showInSchedule 값:', response.data?.showInSchedule || response.data?.data?.showInSchedule);

      // 서버 응답 데이터를 우선 사용, 없으면 updatedData 사용
      const serverResponse = response.data?.data || response.data || {};
      const finalShowInSchedule = serverResponse.showInSchedule !== undefined 
        ? serverResponse.showInSchedule 
        : (updatedData.showInSchedule !== undefined ? updatedData.showInSchedule : true);

      // 전역 상태에서 수정 (서버 응답 데이터 우선 사용)
      const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
      const updatedEvent = {
        id: eventId,
        title: serverResponse.title || updatedData.title,
        startDate: serverResponse.startDate || updatedData.startDate,
        endDate: serverResponse.endDate || updatedData.endDate,
        memo: serverResponse.memo !== undefined ? serverResponse.memo : (updatedData.memo || ''),
        category: '개인',
        color: serverResponse.color || updatedData.color,
        showInSchedule: finalShowInSchedule
      };
      
      setGlobalEvents(safeGlobalEvents.map(e =>
        e.id === eventId
          ? updatedEvent
          : e
      ));

      console.log('🔄 마이페이지 전역 상태 업데이트:', updatedEvent);
      console.log('📅 showInSchedule 필터링 확인 - 수정된 일정:', {
        id: eventId,
        showInSchedule: updatedEvent.showInSchedule,
        willBeFiltered: updatedEvent.showInSchedule === false
      });

      // 메인페이지 캐시 무효화 (최신 데이터 불러오도록)
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const key = `${year}-${month}`;
      setCachedSchedules(prev => ({ ...prev, [key]: undefined }));

      console.log('🗑️ 메인페이지 캐시 무효화:', key);

      // 페이지 새로고침 (메인페이지와 동일하게 즉시 실행)
      console.log('🔄 마이페이지 수정 완료, 새로고침 실행');
        window.location.reload();
    } catch (error) {
      console.error('❌ 마이페이지 일정 수정 실패:', error);
      alert('일정 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(maxPages - 1, prev + 1));
  };

  return (
    <div className="schedule-box">
      <div className="schedule-header">
        <h3>일정표</h3>
        <div className="schedule-actions">
          <button className="add-schedule-btn" onClick={handleAddSchedule}>
            +
          </button>
          {maxPages > 1 && (
            <div className="pagination-controls">
              <button 
                className="pagination-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
              >
                &lt;
              </button>
              <span className="page-info">{currentPage + 1}/{maxPages}</span>
              <button 
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage === maxPages - 1}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="schedule-categories">
        <div className="category-section">
          <div className="category-label">개인</div>
          <div className="schedule-list personal-schedule-list">
            {currentPersonalSchedules.length > 0 ? (
              currentPersonalSchedules.map(schedule => (
                <div 
                  key={schedule.id} 
                  className="schedule-item"
                  onClick={() => handleEventClick(schedule)}
                >
                  <div 
                    className="schedule-color" 
                    style={{ background: schedule.color }}
                  />
                  <div className="schedule-info">
                    <span className="schedule-title">{schedule.title}</span>
                    <span className="schedule-days">
                      {getDaysLeftText(schedule)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-schedule">일정이 없습니다</div>
            )}
          </div>
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
          onClose={() => {
            console.log('❌ 마이페이지 ViewEventModal 닫힘');
            setSelectedEvent(null);
          }}
          onDelete={handleDeleteEvent}
          onEdit={handleEditEvent}
        />
      )}
    </div>
  );
};

export default ScheduleBox;
