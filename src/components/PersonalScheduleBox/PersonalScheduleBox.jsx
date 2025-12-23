<<<<<<< HEAD:src/pages/MyPage/ScheduleBox/ScheduleBox.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddEventModal from '../../../components/Calendar/AddEventModal';
import ViewEventModal from '../../../components/Calendar/ViewEventModal';
import './ScheduleBox.css';

const ScheduleBox = () => {
  const [schedules, setSchedules] = useState([]);
=======
import React, { useState } from 'react';
import { mockSchedule } from '../../mocks/mockSchedule';
import AddEventModal from '../Calendar/AddEventModal';
import ViewEventModal from '../Calendar/ViewEventModal';
import './PersonalScheduleBox.css';

const PersonalScheduleBox = () => {
  const [schedules, setSchedules] = useState(mockSchedule);
>>>>>>> 3abdeff (feat: enhance assignment page features):src/components/PersonalScheduleBox/PersonalScheduleBox.jsx
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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
    }).sort((a, b) => {
      // 마감일 기준으로 빠른 순서대로 정렬
      const dateA = new Date(a.endDate);
      const dateB = new Date(b.endDate);
      return dateA - dateB;
    });
  };

  const filteredSchedules = getFilteredSchedules();
  const personalSchedules = filteredSchedules.filter(s => s.category === '개인');
  const schoolSchedules = filteredSchedules.filter(s => s.category === '학교');

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

  return (
    <div className="personal-schedule-box" style={{ height: '530px' }}>
      <div className="schedule-header">
        <h3>일정표</h3>
        <div className="schedule-actions">
          <button className="add-schedule-btn" onClick={handleAddSchedule}>
            +
          </button>
        </div>
      </div>

      <div className="schedule-categories">
        <div className="category-section">
          <div className="category-label">개인</div>
          <div className="schedule-list personal-schedule-list">
            {personalSchedules.length > 0 ? (
              personalSchedules.map(schedule => (
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
          <div className="schedule-list school-schedule-list">
            {schoolSchedules.length > 0 ? (
              schoolSchedules.map(schedule => (
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

export default PersonalScheduleBox;