import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddEventModal from '../../../components/Calendar/AddEventModal';
import ViewEventModal from '../../../components/Calendar/ViewEventModal';
import './ScheduleBox.css';

const ScheduleBox = () => {
  const [schedules, setSchedules] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('/api/schedules', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchedules(res.data.data);
      } catch (err) {
        setSchedules([]);
      }
    };
    fetchSchedules();
  }, []);

  const getFilteredSchedules = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return schedules.filter(schedule => {
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
    });
  };

  const filteredSchedules = getFilteredSchedules();
  const personalSchedules = filteredSchedules.filter(s => s.category === '개인');
  const schoolSchedules = filteredSchedules.filter(s => s.category === '학교');
  
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
    setSchedules([...schedules, newEvent]);
    setShowAddModal(false);
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
    setSelectedEvent(schedule);
  };

  const handleDeleteEvent = (eventId) => {
    setSchedules(schedules.filter(s => s.id !== eventId));
  };

  const handleEditEvent = (eventId, updatedData) => {
    setSchedules(schedules.map(s => 
      s.id === eventId 
        ? { ...s, ...updatedData }
        : s
    ));
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

        <div className="category-section">
          <div className="category-label">학교</div>
          <div className="schedule-list">
            {currentSchoolSchedules.length > 0 ? (
              currentSchoolSchedules.map(schedule => (
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
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
          onEdit={handleEditEvent}
        />
      )}
    </div>
  );
};

export default ScheduleBox;
