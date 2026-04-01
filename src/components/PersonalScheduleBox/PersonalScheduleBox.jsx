import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAppContext } from '../../App';
import AddEventModal from '../Calendar/AddEventModal';
import ViewEventModal from '../Calendar/ViewEventModal';
import './PersonalScheduleBox.css';

const PersonalScheduleBox = () => {
  const [schedules, setSchedules] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { cachedSchedules, setCachedSchedules, schedulesRefreshing, setSchedulesRefreshing, userRole, profile } = useAppContext();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const userId = profile?.id || profile?.userId || 'unknown';
        const cacheKey = `schedule:${userRole}:${userId}:${year}-${month}`;

        // 캐시 확인
        if (cachedSchedules && cachedSchedules[cacheKey]) {
          setSchedules(cachedSchedules[cacheKey]);
          return;
        }

        // 캐시에 없으면 API 호출
        const res = await axiosInstance.get(`/api/schedule?year=${year}&month=${month}`);
        let data = res.data?.data || [];

        // 백엔드에서 모든 사용자의 일정을 반환하므로 현재 사용자만 필터링
        console.log('PersonalScheduleBox profile:', profile);
        // 가능한 모든 사용자 ID 필드 확인
        const possibleIds = [profile?.id, profile?.userId, profile?.tc001, profile?.user_id, profile?.userID];
        console.log('Possible user IDs:', possibleIds);

        const currentUserId = profile?.id || profile?.userId || profile?.tc001 || profile?.user_id || profile?.userID;

        // 백엔드 CalendarEventDto의 userId는 Long이므로 문자열로 변환해서 비교
        const normalizedUserId = currentUserId ? String(currentUserId) : null;
        const normalizedScheduleUserId = (schedule) => String(schedule.userId);

        console.log('PersonalScheduleBox currentUserId:', currentUserId, 'normalized:', normalizedUserId);

        if (normalizedUserId) {
          data = data.filter(schedule => normalizedScheduleUserId(schedule) === normalizedUserId);
          console.log('Filtered schedules count:', data.length, 'from total:', res.data?.data?.length || 0);
        } else {
          console.warn('No userId found in profile, showing all schedules');
        }

        setSchedules(data);
        setCachedSchedules(prev => ({ ...prev, [cacheKey]: data }));
      } catch (err) {
        if (err.response && err.response.status === 404) {
          try {
            const token = localStorage.getItem('accessToken');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            const cacheKey = `schedule:${userRole}:${year}-${month}`;

            // 리프레시 중복 방지
            if (schedulesRefreshing && schedulesRefreshing[cacheKey]) {
              const waitForCache = () => new Promise(resolve => {
                const start = Date.now();
                const iv = setInterval(() => {
                  if (cachedSchedules && cachedSchedules[cacheKey]) {
                    clearInterval(iv);
                    resolve(cachedSchedules[cacheKey]);
                  }
                  if (Date.now() - start > 5000) {
                    clearInterval(iv);
                    resolve(null);
                  }
                }, 200);
              });
              const data = await waitForCache();
              if (data) {
                setSchedules(data);
                return;
              }
            }

            setSchedulesRefreshing(prev => ({ ...prev, [cacheKey]: true }));
            const refreshRes = await axiosInstance.post(`/api/schedule/refresh-month?year=${year}&month=${month}`, {});
            let data = refreshRes.data?.data || [];

            // 리프레시된 데이터도 사용자별 필터링
            const currentUserId = profile?.id || profile?.userId;
            if (currentUserId) {
              data = data.filter(schedule => schedule.userId === currentUserId);
            }

            setSchedules(data);
            setCachedSchedules(prev => ({ ...prev, [cacheKey]: data }));
            setSchedulesRefreshing(prev => ({ ...prev, [cacheKey]: false }));
          } catch (refreshErr) {
            setSchedules([]);
          }
        } else {
          setSchedules([]);
        }
      }
    };
    fetchSchedules();
  }, [cachedSchedules, schedulesRefreshing, setCachedSchedules, setSchedulesRefreshing, userRole, profile]);

  const getFilteredSchedules = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 오늘 기준 다음 금요일까지 계산
    const dayOfWeek = today.getDay(); // 0(일) ~ 6(토)
    const daysUntilFriday = dayOfWeek <= 5 ? (5 - dayOfWeek) : (5 + 7 - dayOfWeek);
    const fridayDate = new Date(today);
    fridayDate.setDate(today.getDate() + daysUntilFriday);
    
    const filtered = schedules.filter(schedule => {
      // 일정표에 표시 안함으로 설정된 일정 제외
      if (schedule.showInSchedule === false) {
        return false;
      }
      
      const endDate = new Date(schedule.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      // 지난 일정은 제외, 금요일까지만 표시
      if (endDate < today || endDate > fridayDate) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // 마감일 기준으로 빠른 순서대로 정렬
      const dateA = new Date(a.endDate);
      const dateB = new Date(b.endDate);
      return dateA - dateB;
    });

    return filtered;
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
