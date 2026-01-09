import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const usersPerPage = 10;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/user/list?page=${currentPage}&size=${usersPerPage}`);

      const userData = response.data?.data?.content || [];
      setUsers(userData);
      setTotalPages(response.data?.data?.totalPages || 0);
    } catch (error) {
      console.error('유저 목록 조회 실패:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, usersPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axiosInstance.put(`/api/user/role/${userId}`, { role: newRole });

      alert('사용자 권한이 변경되었습니다.');
      fetchUsers(); // 목록 새로고침
    } catch (error) {
      console.error('권한 변경 실패:', error);
      alert('권한 변경에 실패했습니다.');
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return '관리자';
      case 'teacher': return '선생님';
      case 'student': return '학생';
      default: return '알 수 없음';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#ff6b6b';
      case 'teacher': return '#4DC4AB';
      case 'student': return '#74a3ff';
      default: return '#999';
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="user-management">
      <div className="header">
        <h2>사용자 관리</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="이름, 아이디 또는 이메일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="content">
        <div className="user-list">
          {loading ? (
            <div className="loading">사용자 목록을 불러오는 중...</div>
          ) : (
            <>
              <div className="user-stats">
                <div className="stat-item">
                  <span className="stat-label">총 사용자</span>
                  <span className="stat-count">{users.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">관리자</span>
                  <span className="stat-count">{users.filter(u => u.role === 'admin').length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">선생님</span>
                  <span className="stat-count">{users.filter(u => u.role === 'teacher').length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">학생</span>
                  <span className="stat-count">{users.filter(u => u.role === 'student').length}</span>
                </div>
              </div>

              <div className="user-grid">
                {filteredUsers.map(user => (
                  <div key={user.id} className="user-card">
                    <div className="user-header">
                      <img
                        src={user.profileImage || '/profile.png'}
                        alt={user.name}
                        className="user-avatar"
                      />
                      <div className="user-basic-info">
                        <h3 className="user-name">{user.name}</h3>
                        <p className="user-id">{user.userId}</p>
                      </div>
                    </div>

                    <div className="user-details">
                      <div className="detail-row">
                        <span className="label">이메일:</span>
                        <span className="value">{user.email}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">전공:</span>
                        <span className="value">{user.major}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">학년/반:</span>
                        <span className="value">{user.grade}학년 {user.classNumber}반</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">권한:</span>
                        <span
                          className="role-badge"
                          style={{ backgroundColor: getRoleColor(user.role) }}
                        >
                          {getRoleDisplayName(user.role)}
                        </span>
                      </div>
                    </div>

                    <div className="user-actions">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value && e.target.value !== user.role) {
                            handleRoleChange(user.id, e.target.value);
                          }
                          e.target.value = ''; // 선택 초기화
                        }}
                        className="role-select"
                      >
                        <option value="">권한 변경</option>
                        <option value="student">학생</option>
                        <option value="teacher">선생님</option>
                        <option value="admin">관리자</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="page-btn"
                  >
                    이전
                  </button>
                  <span className="page-info">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="page-btn"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
