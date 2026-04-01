import React, { useState, useEffect, useRef } from 'react';
import './Calendar.css';
import AddEventModal from './AddEventModal';
import ViewEventModal from './ViewEventModal';
import ScheduleDetailModal from './ScheduleDetailModal';
import { useAppContext } from '../../App';
import axiosInstance from '../../api/axiosInstance';

const Calendar = () => {
  const { globalEvents, setGlobalEvents, cachedSchedules, setCachedSchedules, schedulesRefreshing, setSchedulesRefreshing, profile } = useAppContext();
  // 최신 cachedSchedules 값을 참조하기 위한 ref
  const cachedSchedulesRef = useRef(cachedSchedules);
  useEffect(() => {
    cachedSchedulesRef.current = cachedSchedules;
  }, [cachedSchedules]);
  // 최신 schedulesRefreshing 값을 참조하기 위한 ref
  const schedulesRefreshingRef = useRef(schedulesRefreshing);
  useEffect(() => {
    schedulesRefreshingRef.current = schedulesRefreshing;
  }, [schedulesRefreshing]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleDetailOpen, setIsScheduleDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // 서버 일정과 전역 일정을 합쳐서 사용
  useEffect(() => {
    // profile이 없으면 일정을 불러오지 않음
    if (!profile) {
      return;
    }

    const fetchSchedules = async () => {
      try {
        // currentDate를 사용하여 현재 선택된 월의 일정을 가져옴
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const currentUserId = profile?.id || profile?.userId || 'unknown';
        const key = `schedule:${currentUserId}:${year}-${month}`;
        
        // 캐시에 이미 있으면 캐시 사용 (GET 요청 안 함)
        const latestCachedSchedules = cachedSchedulesRef.current;
        if (latestCachedSchedules && latestCachedSchedules[key] && Array.isArray(latestCachedSchedules[key]) && latestCachedSchedules[key].length > 0) {
          console.log(`✅ 캐시에서 데이터 로드: ${year}년 ${month}월, ${latestCachedSchedules[key].length}개 일정`);
          const serverEvents = latestCachedSchedules[key];
          // userId 타입 변환을 위한 헬퍼 함수
          const normalizedUserId = currentUserId ? String(currentUserId) : null;
          const normalizedScheduleUserId = (schedule) => String(schedule.userId);

          const filteredServerEvents = serverEvents.filter(event => 
            event.category !== '개인' || (normalizedUserId && normalizedScheduleUserId(event) === normalizedUserId)
          );
          const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
          // globalEvents를 우선으로 병합 (globalEvents의 데이터가 더 최신)
          const merged = [...filteredServerEvents, ...safeGlobalEvents];
          const deduped = merged.reduce((acc, ev) => {
            const existingIndex = acc.findIndex(e => e.id === ev.id);
            if (existingIndex >= 0) {
              // globalEvents에서 온 데이터면 덮어쓰기
              if (safeGlobalEvents.some(ge => ge.id === ev.id)) {
                acc[existingIndex] = ev;
              }
            } else {
              acc.push(ev);
            }
            return acc;
          }, []);
          setEvents(deduped);
          return;
        }
        
        // 캐시에 없으면 GET 요청 실행 (DB에서 최신 데이터 확인)
        console.log(`📡 GET 요청: ${year}년 ${month}월`);
        const res = await axiosInstance.get(`/api/schedule?year=${year}&month=${month}`);
        let serverEvents = res.data?.data || [];
        
        // GET이 빈 배열을 반환하면 POST로 refresh-month 호출하여 데이터 생성
        if (!serverEvents || serverEvents.length === 0) {
          console.log(`📭 ${year}년 ${month}월 일정 데이터 없음, POST로 refresh-month 호출`);
            try {
              // 리프레시 중복 방지 (ref를 사용하여 최신 값 참조)
              const latestSchedulesRefreshing = schedulesRefreshingRef.current;
              if (latestSchedulesRefreshing && latestSchedulesRefreshing[key]) {
                console.log(`⏳ 이미 리프레시 중, 캐시 대기: ${key}`);
                const waitForCache = () => new Promise(resolve => {
                  const start = Date.now();
                  const iv = setInterval(() => {
                    const latestCachedSchedules = cachedSchedulesRef.current;
                    if (latestCachedSchedules && latestCachedSchedules[key] && latestCachedSchedules[key].length > 0) {
                      clearInterval(iv);
                      console.log(`✅ 캐시 대기 완료: ${key}`);
                      resolve(latestCachedSchedules[key]);
                    }
                    // 리프레시가 완료되었는지 확인
                    const currentRefreshing = schedulesRefreshingRef.current;
                    if (!currentRefreshing || !currentRefreshing[key]) {
                      // 리프레시가 완료되었지만 캐시가 없으면 null 반환
                      const finalCachedSchedules = cachedSchedulesRef.current;
                      if (finalCachedSchedules && finalCachedSchedules[key]) {
                        clearInterval(iv);
                        resolve(finalCachedSchedules[key]);
                      }
                    }
                    if (Date.now() - start > 10000) { 
                      console.log(`⏰ 캐시 대기 타임아웃: ${key}`);
                      clearInterval(iv); 
                      resolve(null); 
                    }
                  }, 200);
                });
                serverEvents = await waitForCache() || [];
                if (serverEvents.length === 0) {
                  console.log(`⚠️ 캐시 대기 후에도 데이터 없음, POST 호출: ${key}`);
                  // 대기 후에도 데이터가 없으면 POST 호출
                  setSchedulesRefreshing(prev => ({ ...prev, [key]: true }));
                  try {
                    const refreshRes = await axiosInstance.post(`/api/schedule/refresh-month?year=${year}&month=${month}`, {});
                    serverEvents = refreshRes.data?.data || [];
                    setSchedulesRefreshing(prev => ({ ...prev, [key]: false }));
                    console.log(`✅ POST refresh-month 성공 (대기 후), ${serverEvents.length}개 일정 로드: ${key}`);
                  } catch (postErr) {
                    console.error('❌ POST refresh-month 실패 (대기 후):', postErr);
                    setSchedulesRefreshing(prev => ({ ...prev, [key]: false }));
                    serverEvents = [];
                  }
                }
              } else {
                // 리프레시 시작 전에 다시 한 번 확인 (race condition 방지)
                const doubleCheckRefreshing = schedulesRefreshingRef.current;
                if (doubleCheckRefreshing && doubleCheckRefreshing[key]) {
                  console.log(`⚠️ 리프레시 상태 변경 감지, 대기로 전환: ${key}`);
                  const waitForCache = () => new Promise(resolve => {
                    const start = Date.now();
                    const iv = setInterval(() => {
                      const latestCachedSchedules = cachedSchedulesRef.current;
                      if (latestCachedSchedules && latestCachedSchedules[key] && latestCachedSchedules[key].length > 0) {
                        clearInterval(iv);
                        resolve(latestCachedSchedules[key]);
                      }
                      const currentRefreshing = schedulesRefreshingRef.current;
                      if (!currentRefreshing || !currentRefreshing[key]) {
                        const finalCachedSchedules = cachedSchedulesRef.current;
                        if (finalCachedSchedules && finalCachedSchedules[key]) {
                          clearInterval(iv);
                          resolve(finalCachedSchedules[key]);
                        }
                      }
                      if (Date.now() - start > 10000) { 
                        clearInterval(iv); 
                        resolve(null); 
                      }
                    }, 200);
                  });
                  serverEvents = await waitForCache() || [];
                  // 대기 후에도 데이터가 없으면 POST 호출
                  if (serverEvents.length === 0) {
                    console.log(`⚠️ 대기 후에도 데이터 없음, POST 호출: ${key}`);
                    setSchedulesRefreshing(prev => ({ ...prev, [key]: true }));
                    try {
                      const refreshRes = await axiosInstance.post(`/api/schedule/refresh-month?year=${year}&month=${month}`, {});
                      serverEvents = refreshRes.data?.data || [];
                      setSchedulesRefreshing(prev => ({ ...prev, [key]: false }));
                      console.log(`✅ POST refresh-month 성공 (대기 후), ${serverEvents.length}개 일정 로드: ${key}`);
                    } catch (postErr) {
                      console.error('❌ POST refresh-month 실패 (대기 후):', postErr);
                      setSchedulesRefreshing(prev => ({ ...prev, [key]: false }));
                      serverEvents = [];
                    }
                  }
                } else {
                  console.log(`🚀 POST refresh-month 호출 시작: ${key}`);
                  setSchedulesRefreshing(prev => ({ ...prev, [key]: true }));
                  const refreshRes = await axiosInstance.post(`/api/schedule/refresh-month?year=${year}&month=${month}`, {});
                  serverEvents = refreshRes.data?.data || [];
                  setSchedulesRefreshing(prev => ({ ...prev, [key]: false }));
                  console.log(`✅ POST refresh-month 성공, ${serverEvents.length}개 일정 로드: ${key}`);
                }
              }
            } catch (refreshErr) {
              console.error('❌ POST refresh-month 실패:', refreshErr);
              setSchedulesRefreshing(prev => ({ ...prev, [key]: false }));
              // POST 실패 시에도 캐시 확인 (ref를 사용하여 최신 값 참조)
              const latestCachedSchedules = cachedSchedulesRef.current;
              if (latestCachedSchedules && latestCachedSchedules[key] && latestCachedSchedules[key].length > 0) {
                console.log(`📦 POST 실패, 캐시에서 데이터 로드`);
                serverEvents = latestCachedSchedules[key];
              } else {
                serverEvents = [];
              }
            }
        } else {
          console.log(`✅ GET 성공, ${serverEvents.length}개 일정 로드`);
        }
        
        // 캐시에 저장 (원본 serverEvents 저장, 필터링 전 데이터)
        // 이렇게 하면 나중에 캐시에서 읽을 때도 원본 데이터를 사용할 수 있음
        console.log(`💾 캐시에 저장: key="${key}", ${serverEvents.length}개 일정`);
        setCachedSchedules(prev => {
          const updated = { ...prev, [key]: serverEvents }; // 필터링 전 원본 데이터 저장
          console.log(`💾 캐시 업데이트 완료, 전체 키:`, Object.keys(updated));
          return updated;
        });
        
        // 개인 일정은 현재 사용자의 것만 포함 (userId로 필터링)
        // userId 타입 변환을 위한 헬퍼 함수
        const normalizedUserId = currentUserId ? String(currentUserId) : null;
        const normalizedScheduleUserId = (schedule) => String(schedule.userId);

        const filteredServerEvents = serverEvents.filter(event => 
          event.category !== '개인' || (normalizedUserId && normalizedScheduleUserId(event) === normalizedUserId)
        );
        const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
        // globalEvents를 우선으로 병합 (globalEvents의 데이터가 더 최신)
        const merged = [...filteredServerEvents, ...safeGlobalEvents];
        const deduped = merged.reduce((acc, ev) => {
          const existingIndex = acc.findIndex(e => e.id === ev.id);
          if (existingIndex >= 0) {
            // globalEvents에서 온 데이터면 덮어쓰기
            if (safeGlobalEvents.some(ge => ge.id === ev.id)) {
              acc[existingIndex] = ev;
            }
          } else {
            acc.push(ev);
          }
          return acc;
        }, []);
        setEvents(deduped);
      } catch (err) {
        // GET 요청 실패 시 캐시 확인
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const currentUserId = profile?.id || profile?.userId || 'unknown';
        const key = `schedule:${currentUserId}:${year}-${month}`;
        
        // 캐시에 데이터가 있으면 사용 (ref를 사용하여 최신 값 참조)
        const latestCachedSchedules = cachedSchedulesRef.current;
        if (latestCachedSchedules && latestCachedSchedules[key] && latestCachedSchedules[key].length > 0) {
          console.log(`📦 GET 실패, 캐시에서 데이터 로드 (${err.response?.status || 'network error'})`);
          const serverEvents = latestCachedSchedules[key];
          // userId 타입 변환을 위한 헬퍼 함수
          const normalizedUserId = currentUserId ? String(currentUserId) : null;
          const normalizedScheduleUserId = (schedule) => String(schedule.userId);

          const filteredServerEvents = serverEvents.filter(event => 
            event.category !== '개인' || (normalizedUserId && normalizedScheduleUserId(event) === normalizedUserId)
          );
          const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
          // globalEvents를 우선으로 병합 (globalEvents의 데이터가 더 최신)
          const merged = [...filteredServerEvents, ...safeGlobalEvents];
          const deduped = merged.reduce((acc, ev) => {
            const existingIndex = acc.findIndex(e => e.id === ev.id);
            if (existingIndex >= 0) {
              // globalEvents에서 온 데이터면 덮어쓰기
              if (safeGlobalEvents.some(ge => ge.id === ev.id)) {
                acc[existingIndex] = ev;
              }
            } else {
              acc.push(ev);
            }
            return acc;
          }, []);
          setEvents(deduped);
          return;
        }
        
        // 캐시도 없으면 404인 경우에만 POST로 refresh-month 호출
        if (err.response && err.response.status === 404) {
          try {
            const token = localStorage.getItem('accessToken');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            // 이미 다른 컴포넌트가 리프레시 중이면 캐시가 채워질 때까지 대기 (ref를 사용하여 최신 값 참조)
            const latestSchedulesRefreshing = schedulesRefreshingRef.current;
            if (latestSchedulesRefreshing && latestSchedulesRefreshing[key]) {
              const waitForCache = () => new Promise(resolve => {
                const start = Date.now();
                const iv = setInterval(() => {
                  const latestCachedSchedules = cachedSchedulesRef.current;
                  if (latestCachedSchedules && latestCachedSchedules[key]) {
                    clearInterval(iv);
                    resolve(latestCachedSchedules[key]);
                  }
                  if (Date.now() - start > 5000) { clearInterval(iv); resolve(null); }
                }, 200);
              });
              const serverEvents = await waitForCache();
              if (serverEvents && serverEvents.length > 0) {
              // userId 타입 변환을 위한 헬퍼 함수
              const normalizedUserId = currentUserId ? String(currentUserId) : null;
              const normalizedScheduleUserId = (schedule) => String(schedule.userId);

              const filteredServerEvents = serverEvents.filter(event => 
                event.category !== '개인' || (normalizedUserId && normalizedScheduleUserId(event) === normalizedUserId)
              );
              const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
              // globalEvents를 우선으로 병합 (globalEvents의 데이터가 더 최신)
              const merged = [...filteredServerEvents, ...safeGlobalEvents];
              const deduped = merged.reduce((acc, ev) => {
                const existingIndex = acc.findIndex(e => e.id === ev.id);
                if (existingIndex >= 0) {
                  // globalEvents에서 온 데이터면 덮어쓰기
                  if (safeGlobalEvents.some(ge => ge.id === ev.id)) {
                    acc[existingIndex] = ev;
                  }
                } else {
                  acc.push(ev);
                }
                return acc;
              }, []);
              setEvents(deduped);
              return;
              }
            }

            setSchedulesRefreshing(prev => ({ ...prev, [key]: true }));
            const refreshRes = await axiosInstance.post(`/api/schedule/refresh-month?year=${year}&month=${month}`, {});
            const serverEvents = refreshRes.data?.data || [];
            // userId 타입 변환을 위한 헬퍼 함수
            const normalizedUserId = currentUserId ? String(currentUserId) : null;
            const normalizedScheduleUserId = (schedule) => String(schedule.userId);

            const filteredServerEvents = serverEvents.filter(event => 
              event.category !== '개인' || (normalizedUserId && normalizedScheduleUserId(event) === normalizedUserId)
            );
            setCachedSchedules(prev => ({ ...prev, [key]: filteredServerEvents }));
            const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
            // globalEvents를 우선으로 병합 (globalEvents의 데이터가 더 최신)
            const merged = [...filteredServerEvents, ...safeGlobalEvents];
            const deduped = merged.reduce((acc, ev) => {
              const existingIndex = acc.findIndex(e => e.id === ev.id);
              if (existingIndex >= 0) {
                // globalEvents에서 온 데이터면 덮어쓰기
                if (safeGlobalEvents.some(ge => ge.id === ev.id)) {
                  acc[existingIndex] = ev;
                }
              } else {
                acc.push(ev);
              }
              return acc;
            }, []);
            setEvents(deduped);
            setSchedulesRefreshing(prev => ({ ...prev, [key]: false }));
          } catch (refreshErr) {
            console.error('❌ POST refresh-month 실패:', refreshErr);
            setSchedulesRefreshing(prev => ({ ...prev, [key]: false }));
            // POST 실패 시에도 캐시 재확인 (ref를 사용하여 최신 값 참조)
            const latestCachedSchedules = cachedSchedulesRef.current;
            if (latestCachedSchedules && latestCachedSchedules[key] && latestCachedSchedules[key].length > 0) {
              console.log(`📦 POST 실패, 캐시에서 데이터 로드`);
              const serverEvents = latestCachedSchedules[key];
              const normalizedUserId = currentUserId ? String(currentUserId) : null;
              const normalizedScheduleUserId = (schedule) => String(schedule.userId);
              const filteredServerEvents = serverEvents.filter(event => 
                event.category !== '개인' || (normalizedUserId && normalizedScheduleUserId(event) === normalizedUserId)
              );
              const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
              const merged = [...filteredServerEvents, ...safeGlobalEvents];
              const deduped = merged.reduce((acc, ev) => {
                const existingIndex = acc.findIndex(e => e.id === ev.id);
                if (existingIndex >= 0) {
                  if (safeGlobalEvents.some(ge => ge.id === ev.id)) {
                    acc[existingIndex] = ev;
                  }
                } else {
                  acc.push(ev);
                }
                return acc;
              }, []);
              setEvents(deduped);
            } else {
              const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
              setEvents([...safeGlobalEvents]);
            }
          }
        } else {
          // 404가 아닌 다른 에러인 경우에도 캐시 재확인 (ref를 사용하여 최신 값 참조)
          const latestCachedSchedules = cachedSchedulesRef.current;
          if (latestCachedSchedules && latestCachedSchedules[key] && latestCachedSchedules[key].length > 0) {
            console.log(`📦 GET 에러 (${err.response?.status || 'network error'}), 캐시에서 데이터 로드`);
            const serverEvents = latestCachedSchedules[key];
            const normalizedUserId = currentUserId ? String(currentUserId) : null;
            const normalizedScheduleUserId = (schedule) => String(schedule.userId);
            const filteredServerEvents = serverEvents.filter(event => 
              event.category !== '개인' || (normalizedUserId && normalizedScheduleUserId(event) === normalizedUserId)
            );
            const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
            const merged = [...filteredServerEvents, ...safeGlobalEvents];
            const deduped = merged.reduce((acc, ev) => {
              const existingIndex = acc.findIndex(e => e.id === ev.id);
              if (existingIndex >= 0) {
                if (safeGlobalEvents.some(ge => ge.id === ev.id)) {
                  acc[existingIndex] = ev;
                }
              } else {
                acc.push(ev);
              }
              return acc;
            }, []);
            setEvents(deduped);
          } else {
            console.error('❌ GET 실패 및 캐시 없음:', err.response?.status || err.message);
            const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
            setEvents([...safeGlobalEvents]);
          }
        }
      }
    };
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, globalEvents, profile]);

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
    setIsScheduleDetailOpen(true);
  };

  const handleAddEvent = async (eventData) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
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

      console.log('📤 캘린더 개인 일정 DB 저장 시도:', eventPayload);

      const response = await axiosInstance.post('/api/schedule/add', eventPayload);

      console.log('✅ 캘린더 개인 일정 DB 저장 성공:', response.data);

      // 성공 시 전역 상태에도 추가 (UI 즉시 반영)
      const newEvent = {
        id: response.data?.data?.id || Date.now(), // DB에서 받은 ID 우선 사용
        ...eventData,
        category: '개인',
        showInSchedule: eventData.showInSchedule !== undefined ? eventData.showInSchedule : true
      };

      const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
      setGlobalEvents([...safeGlobalEvents, newEvent]);

      setIsModalOpen(false);
    } catch (error) {
      console.error('❌ 캘린더 개인 일정 DB 저장 실패:', error.response?.data || error.message);
      alert('개인 일정 추가에 실패했습니다.');
    }
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      console.log('🗑️ 캘린더 개인 일정 DB 삭제 시도:', eventId);
      await axiosInstance.delete(`/api/schedule/${eventId}`);

      console.log('✅ 캘린더 개인 일정 DB 삭제 성공');

      // 전역 상태에서도 삭제
      const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
      setGlobalEvents(safeGlobalEvents.filter(e => e.id !== eventId));

      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error('❌ 캘린더 개인 일정 DB 삭제 실패:', error.response?.data || error.message);
      alert('개인 일정 삭제에 실패했습니다.');
    }
  };

  const handleEditEvent = async (eventId, updatedData) => {
    console.log('🔧 handleEditEvent 호출됨:', { eventId, updatedData });

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

      console.log('✏️ 캘린더 개인 일정 DB 수정 시도:', eventId, updatePayload);
      await axiosInstance.put(`/api/schedule/${eventId}`, updatePayload);

      console.log('✅ 캘린더 개인 일정 DB 수정 성공');

      // 전역 상태에서도 수정 (UI 즉시 반영)
      const safeGlobalEvents = Array.isArray(globalEvents) ? globalEvents : [];
      const updatedEvent = { ...updatedData, id: eventId };
      setGlobalEvents(safeGlobalEvents.map(e =>
        e.id === eventId
          ? updatedEvent
          : e
      ));

      console.log('🔄 전역 상태 업데이트 완료:', updatedEvent);

      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error('❌ 캘린더 개인 일정 DB 수정 실패:', error.response?.data || error.message);
      alert('개인 일정 수정에 실패했습니다.');
    }
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
        <h2>{year}년 {month + 1}월</h2>
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

      {isScheduleDetailOpen && selectedDate && (
        <ScheduleDetailModal
          selectedDate={selectedDate}
          events={events}
          onClose={() => setIsScheduleDetailOpen(false)}
          onAddEvent={handleAddEvent}
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={handleEditEvent}
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
