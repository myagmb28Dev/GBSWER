import React, { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import './ScheduleManagement.css';

const ScheduleManagement = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const handleRefreshSchedule = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('accessToken');

      const response = await axiosInstance.post(`/api/schedule/refresh-month?year=${selectedYear}&month=${selectedMonth}`, {});

      setLastRefresh(new Date());
      alert(`${selectedYear}년 ${selectedMonth}월 학사일정이 성공적으로 새로고침되었습니다.`);

      console.log('학사일정 새로고침 결과:', response.data);
    } catch (error) {
      console.error('학사일정 새로고침 실패:', error);
      alert('학사일정 새로고침에 실패했습니다.');
    } finally {
      setRefreshing(false);
    }
  };

  const getCurrentMonthSchedule = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axiosInstance.get(`/api/schedule?year=${selectedYear}&month=${selectedMonth}`);

      console.log('현재 월 일정 조회:', response.data);
      alert(`${selectedYear}년 ${selectedMonth}월 일정을 확인했습니다. (콘솔에서 확인)`);
    } catch (error) {
      console.error('일정 조회 실패:', error);
      alert('일정 조회에 실패했습니다.');
    }
  };

  const getTodaySchedule = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axiosInstance.get('/api/schedule/today');

      console.log('오늘 일정 조회:', response.data);
      alert('오늘 일정을 확인했습니다. (콘솔에서 확인)');
    } catch (error) {
      console.error('오늘 일정 조회 실패:', error);
      alert('오늘 일정 조회에 실패했습니다.');
    }
  };

  return (
    <div className="schedule-management">
      <div className="header">
        <h2>일정/캘린더 관리</h2>
        <div className="last-refresh">
          {lastRefresh && (
            <span>마지막 새로고침: {lastRefresh.toLocaleString()}</span>
          )}
        </div>
      </div>

      <div className="content">
        <div className="schedule-controls">
          <div className="period-selector">
            <label>대상 기간:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="year-select"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="month-select"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
          </div>

          <div className="action-buttons">
            <button
              onClick={handleRefreshSchedule}
              disabled={refreshing}
              className="refresh-btn"
            >
              {refreshing ? '새로고침 중...' : '학사일정 새로고침'}
            </button>

            <button
              onClick={getCurrentMonthSchedule}
              className="view-btn"
            >
              월별 일정 조회
            </button>

            <button
              onClick={getTodaySchedule}
              className="view-btn"
            >
              오늘 일정 조회
            </button>
          </div>
        </div>

        <div className="info-section">
          <h3>관리자 전용 일정 관리 기능</h3>
          <div className="info-grid">
            <div className="info-item">
              <h4>학사일정 새로고침</h4>
              <p>NEIS에서 최신 학사일정을 가져와 시스템에 반영합니다.</p>
              <ul>
                <li>방학 일정</li>
                <li>시험 기간</li>
                <li>행사 일정</li>
                <li>공휴일</li>
              </ul>
            </div>

            <div className="info-item">
              <h4>일정 조회</h4>
              <p>시스템에 저장된 일정 데이터를 확인할 수 있습니다.</p>
              <ul>
                <li>월별 일정 조회</li>
                <li>오늘 일정 조회</li>
                <li>실시간 데이터 확인</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="warning-section">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <h4>주의사항</h4>
            <ul>
              <li>학사일정 새로고침은 외부 API(NEIS)를 호출하므로 시간이 소요될 수 있습니다.</li>
              <li>새로고침 중에는 다른 관리 작업을 피해주세요.</li>
              <li>일정 데이터는 캐시되어 빠르게 조회됩니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;
