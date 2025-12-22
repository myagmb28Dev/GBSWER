import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Calendar.css';
import AddEventModal from './AddEventModal';
import ViewEventModal from './ViewEventModal';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('/api/schedules', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(res.data.data);
      } catch (err) {
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day) => {
    setSelectedDate(new Date(year, month, day));
    setIsModalOpen(true);
  };

  const handleAddEvent = (eventData) => {
    setEvents([...events, { ...eventData, id: Date.now() }]);
    setIsModalOpen(false);
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const handleEditEvent = (eventId, updatedData) => {
    setEvents(events.map(e => e.id === eventId ? { ...e, ...updatedData } : e));
  };

  const getEventPosition = (event, day) => {
    const currentDate = new Date(year, month, day);
    currentDate.setHours(0, 0, 0, 0);
    
    const eventStart = new Date(event.startDate);
    eventStart.setHours(0, 0, 0, 0);
    
    const eventEnd = new Date(event.endDate);
    eventEnd.setHours(0, 0, 0, 0);
    
    const isStart = currentDate.getTime() === eventStart.getTime();
    const isEnd = currentDate.getTime() === eventEnd.getTime();
    
    return { isStart, isEnd };
  };

  const getEventsForDate = (day) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      eventStart.setHours(0, 0, 0, 0);
      
      const eventEnd = new Date(event.endDate);
      eventEnd.setHours(0, 0, 0, 0);
      
      return date.getTime() >= eventStart.getTime() && date.getTime() <= eventEnd.getTime();
    });
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {
      const day = i - firstDayOfMonth + 1;
      const isCurrentMonth = day > 0 && day <= daysInMonth;
      const dateEvents = isCurrentMonth ? getEventsForDate(day) : [];

      days.push(
        <div
          key={i}
          className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'}`}
          onClick={() => isCurrentMonth && handleDateClick(day)}
        >
          {isCurrentMonth && <span className="day-number">{day}</span>}
          <div className="events-container">
            {dateEvents.map(event => {
              const { isStart, isEnd } = getEventPosition(event, day);
              return (
                <div
                  key={event.id}
                  className={`event-bar ${isStart ? 'event-start' : ''} ${isEnd ? 'event-end' : ''}`}
                  style={{ backgroundColor: event.color }}
                  title={`${event.title}\n${event.startDate} ~ ${event.endDate}`}
                  onClick={(e) => handleEventClick(event, e)}
                >
                  {isStart && <span className="event-title">{event.title}</span>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <h2>{month + 1}월 일정</h2>
        <div className="calendar-nav">
          <button onClick={prevMonth}>&lt;</button>
          <button onClick={nextMonth}>&gt;</button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="weekday-header">일</div>
        <div className="weekday-header">월</div>
        <div className="weekday-header">화</div>
        <div className="weekday-header">수</div>
        <div className="weekday-header">목</div>
        <div className="weekday-header">금</div>
        <div className="weekday-header">토</div>
        {renderCalendarDays()}
      </div>

      {isModalOpen && (
        <AddEventModal
          selectedDate={selectedDate}
          onClose={() => setIsModalOpen(false)}
          onAddEvent={handleAddEvent}
        />
      )}

      {isViewModalOpen && selectedEvent && (
        <ViewEventModal
          event={selectedEvent}
          onClose={() => setIsViewModalOpen(false)}
          onDelete={handleDeleteEvent}
          onEdit={handleEditEvent}
        />
      )}
    </div>
  );
};

export default Calendar;
