import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './StudentManagement.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const studentsPerPage = 10;

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/student/list?page=${currentPage}&size=${studentsPerPage}`);

      const studentData = response.data?.data?.content || [];
      setStudents(studentData);
      setTotalPages(response.data?.data?.totalPages || 0);
    } catch (error) {
      console.error('학생 목록 조회 실패:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, studentsPerPage]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const fetchStudentProfile = async (studentId) => {
    try {
      const response = await axiosInstance.get(`/api/student/${studentId}/profile`);

      setSelectedStudent(response.data?.data);
    } catch (error) {
      console.error('학생 프로필 조회 실패:', error);
      alert('학생 프로필을 불러올 수 없습니다.');
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.includes(searchTerm)
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="student-management">
      <div className="header">
        <h2>학생 관리</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="이름 또는 학번으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="content">
        <div className="student-list">
          {loading ? (
            <div className="loading">학생 목록을 불러오는 중...</div>
          ) : (
            <>
              <div className="student-grid">
                {filteredStudents.map(student => (
                  <div
                    key={student.id}
                    className="student-card"
                    onClick={() => fetchStudentProfile(student.id)}
                  >
                    <div className="student-avatar">
                      <img
                        src={student.profileImage || '/profile.png'}
                        alt={student.name}
                        className="avatar-image"
                      />
                    </div>
                    <div className="student-info">
                      <h3 className="student-name">{student.name}</h3>
                      <p className="student-id">{student.studentId}</p>
                      <p className="student-major">{student.major} {student.grade}학년</p>
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

        {/* 학생 상세 프로필 */}
        {selectedStudent && (
          <div className="student-detail">
            <div className="detail-header">
              <h3>학생 상세 정보</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="detail-content">
              <div className="profile-section">
                <img
                  src={selectedStudent.profileImage || '/profile.png'}
                  alt={selectedStudent.name}
                  className="detail-avatar"
                />
                <div className="profile-info">
                  <h4>{selectedStudent.name}</h4>
                  <p>학번: {selectedStudent.studentId}</p>
                  <p>전공: {selectedStudent.major}</p>
                  <p>학년: {selectedStudent.grade}학년</p>
                  <p>반: {selectedStudent.classNumber}반</p>
                  <p>번호: {selectedStudent.studentNumber}번</p>
                  <p>이메일: {selectedStudent.email}</p>
                  {selectedStudent.bio && (
                    <div className="bio">
                      <p><strong>자기소개:</strong></p>
                      <p>{selectedStudent.bio}</p>
                    </div>
                  )}
                  <p>가입일: {new Date(selectedStudent.admissionYear).getFullYear()}년</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
