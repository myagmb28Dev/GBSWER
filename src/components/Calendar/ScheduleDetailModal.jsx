import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useAppContext } from '../../App';
import AddEventModal from './AddEventModal';
import './ScheduleDetailModal.css';

const ScheduleDetailModal = ({ 
  selectedDate, 
  events, 
  onClose, 
  onAddEvent,
  onDeleteEvent,
  onEditEvent 
}) => {
  const { userRole } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    return events.filter(event => {
      const eventStart = formatDate(new Date(event.startDate));
      const eventEnd = formatDate(new Date(event.endDate));
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const dayEvents = getEventsForDate(currentDate);
  const hasScroll = dayEvents.length >= 4;

  return (
    <div className="schedule-detail-overlay" onClick={onClose}>
      <div className="schedule-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <h2>{formatDisplayDate(currentDate)}</h2>
        </div>

        <div className="modal-nav">
          <button className="nav-btn prev-btn" onClick={handlePrevDay}>
            <ChevronLeft size={24} />
          </button>
          <button className="nav-btn next-btn" onClick={handleNextDay}>
            <ChevronRight size={24} />
          </button>
        </div>

        <div className={`events-list ${hasScroll ? 'has-scroll' : ''}`}>
          {dayEvents.length > 0 ? (
            dayEvents.map(event => (
              <div key={event.id} className="event-item" style={{ borderLeftColor: event.color }}>
                <div className="event-info">
                  <h4>{event.title}</h4>
                  <p className="event-date">
                    {event.startDate} ~ {event.endDate}
                  </p>
                </div>
                {/* 학생은 학사일정을 삭제할 수 없음 (카테고리: 학교, 학사, 학과) */}
                {(userRole !== 'student' || (event.category !== '학교' && event.category !== '학사' && event.category !== '학과')) && (
                  <button 
                    className="delete-event-btn"
                    onClick={() => onDeleteEvent(event.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="no-events">이 날짜에 일정이 없습니다.</p>
          )}
        </div>

        <button 
          className="add-event-btn" 
          onClick={() => setIsAddEventModalOpen(true)}
        >
          <Plus size={20} /> 일정 추가
        </button>

        {isAddEventModalOpen && (
          <AddEventModal
            selectedDate={currentDate}
            onClose={() => setIsAddEventModalOpen(false)}
            onAddEvent={(eventData) => {
              onAddEvent(eventData);
              setIsAddEventModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ScheduleDetailModal;
