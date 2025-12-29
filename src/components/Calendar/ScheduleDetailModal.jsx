import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import AddEventModal from './AddEventModal';
<<<<<<< HEAD
=======
import ViewEventModal from './ViewEventModal';
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
import './ScheduleDetailModal.css';

const ScheduleDetailModal = ({ 
  selectedDate, 
  events, 
  onClose, 
  onAddEvent,
  onDeleteEvent,
  onEditEvent 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
<<<<<<< HEAD
=======
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)

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

<<<<<<< HEAD
=======
  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
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
<<<<<<< HEAD
              <div key={event.id} className="event-item" style={{ borderLeftColor: event.color }}>
=======
              <div 
                key={event.id} 
                className="event-item" 
                style={{ borderLeftColor: event.color }}
                onClick={(e) => handleEventClick(event, e)}
              >
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
                <div className="event-info">
                  <h4>{event.title}</h4>
                  <p className="event-date">
                    {event.startDate} ~ {event.endDate}
                  </p>
                </div>
                <button 
                  className="delete-event-btn"
<<<<<<< HEAD
                  onClick={() => onDeleteEvent(event.id)}
=======
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEvent(event.id);
                  }}
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
                >
                  ×
                </button>
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
<<<<<<< HEAD
=======

        {isViewModalOpen && selectedEvent && (
          <ViewEventModal
            event={selectedEvent}
            onClose={() => setIsViewModalOpen(false)}
            onDelete={onDeleteEvent}
            onEdit={onEditEvent}
          />
        )}
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
      </div>
    </div>
  );
};

export default ScheduleDetailModal;
