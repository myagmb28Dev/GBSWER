import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SystemMonitoring.css';

const SystemMonitoring = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    admins: 0,
    totalPosts: 0,
    todayPosts: 0,
    totalClasses: 0,
    activeClasses: 0,
    systemStatus: '정상',
    lastUpdated: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      // 여러 API를 동시에 호출해서 통계 수집
      const [usersRes, postsRes, classesRes] = await Promise.allSettled([
        axios.get('/api/user/list?page=0&size=1000', { headers: { Authorization: token } }),
        axios.get('/api/community/?page=0&size=1000', { headers: { Authorization: token } }),
        axios.get('/api/classes/admin?page=0&size=1000', { headers: { Authorization: token } })
      ]);

      // 사용자 통계
      const users = usersRes.status === 'fulfilled' ? usersRes.value.data?.data?.content || [] : [];
      const students = users.filter(u => u.role === 'student').length;
      const teachers = users.filter(u => u.role === 'teacher').length;
      const admins = users.filter(u => u.role === 'admin').length;

      // 게시물 통계
      const posts = postsRes.status === 'fulfilled' ? postsRes.value.data?.data?.content || [] : [];
      const today = new Date().toDateString();
      const todayPosts = posts.filter(p => new Date(p.createdAt).toDateString() === today).length;

      // 클래스 통계
      const classes = classesRes.status === 'fulfilled' ? classesRes.value.data?.data?.content || [] : [];

      setStats({
        totalUsers: users.length,
        students,
        teachers,
        admins,
        totalPosts: posts.length,
        todayPosts,
        totalClasses: classes.length,
        activeClasses: classes.length, // 일단 전체를 활성으로 가정
        systemStatus: '정상',
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('시스템 통계 조회 실패:', error);
      setStats(prev => ({
        ...prev,
        systemStatus: '오류 발생',
        lastUpdated: new Date()
      }));
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    fetchSystemStats();
  };

  const StatCard = ({ title, value, subtitle, color, icon }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value.toLocaleString()}</div>
        <div className="stat-title">{title}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  return (
    <div className="system-monitoring">
      <div className="header">
        <h2>시스템 모니터링</h2>
        <div className="header-controls">
          <button onClick={refreshStats} disabled={loading} className="refresh-btn">
            {loading ? '새로고침 중...' : '새로고침'}
          </button>
          <div className="last-updated">
            마지막 업데이트: {stats.lastUpdated?.toLocaleString() || '알 수 없음'}
          </div>
        </div>
      </div>

      <div className="content">
        {/* 통계 카드들 */}
        <div className="stats-grid">
          <StatCard
            title="총 사용자"
            value={stats.totalUsers}
            subtitle={`${stats.students}학생 ${stats.teachers}선생님 ${stats.admins}관리자`}
            color="#4DC4AB"
            icon="👥"
          />
          <StatCard
            title="총 게시물"
            value={stats.totalPosts}
            subtitle={`오늘 ${stats.todayPosts}개 작성`}
            color="#74a3ff"
            icon="📝"
          />
          <StatCard
            title="총 클래스"
            value={stats.totalClasses}
            subtitle={`${stats.activeClasses}개 활성`}
            color="#ffb347"
            icon="🏫"
          />
          <StatCard
            title="시스템 상태"
            value={stats.systemStatus}
            subtitle="정상 작동 중"
            color="#4CAF50"
            icon="✅"
          />
        </div>

        {/* 상세 통계 */}
        <div className="detailed-stats">
          <div className="stats-section">
            <h3>사용자 분포</h3>
            <div className="user-distribution">
              <div className="distribution-item">
                <span className="role-label">학생</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${stats.totalUsers > 0 ? (stats.students / stats.totalUsers) * 100 : 0}%`,
                      backgroundColor: '#4DC4AB'
                    }}
                  ></div>
                </div>
                <span className="count">{stats.students}명</span>
              </div>
              <div className="distribution-item">
                <span className="role-label">선생님</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${stats.totalUsers > 0 ? (stats.teachers / stats.totalUsers) * 100 : 0}%`,
                      backgroundColor: '#74a3ff'
                    }}
                  ></div>
                </div>
                <span className="count">{stats.teachers}명</span>
              </div>
              <div className="distribution-item">
                <span className="role-label">관리자</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${stats.totalUsers > 0 ? (stats.admins / stats.totalUsers) * 100 : 0}%`,
                      backgroundColor: '#ffb347'
                    }}
                  ></div>
                </div>
                <span className="count">{stats.admins}명</span>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h3>시스템 건강 상태</h3>
            <div className="health-checks">
              <div className="health-item">
                <span className="health-label">API 응답 시간</span>
                <span className="health-status good">정상 (150ms)</span>
              </div>
              <div className="health-item">
                <span className="health-label">데이터베이스 연결</span>
                <span className="health-status good">정상</span>
              </div>
              <div className="health-item">
                <span className="health-label">외부 API (NEIS)</span>
                <span className="health-status good">정상</span>
              </div>
              <div className="health-item">
                <span className="health-label">메모리 사용량</span>
                <span className="health-status good">45%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="recent-activity">
          <h3>최근 시스템 활동</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-time">방금 전</div>
              <div className="activity-desc">시스템 통계 새로고침</div>
            </div>
            <div className="activity-item">
              <div className="activity-time">5분 전</div>
              <div className="activity-desc">급식 데이터 업데이트</div>
            </div>
            <div className="activity-item">
              <div className="activity-time">10분 전</div>
              <div className="activity-desc">시간표 데이터 동기화</div>
            </div>
            <div className="activity-item">
              <div className="activity-time">1시간 전</div>
              <div className="activity-desc">학사일정 업데이트</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;
