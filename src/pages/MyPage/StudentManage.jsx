import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentManage.css';

const StudentManage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('/api/students', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(res.data.data);
      } catch (err) {
        setStudents([]);
      }
      setLoading(false);
    };
    fetchStudents();
  }, []);

  if (loading) return <div>학생 목록을 불러오는 중...</div>;

  return (
    <div className="student-manage-container">
      <h2>학생 관리</h2>
      <table className="student-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>학번</th>
            <th>학과</th>
            <th>학년</th>
            <th>반</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.studentNumber}</td>
              <td>{student.major}</td>
              <td>{student.grade}</td>
              <td>{student.classNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentManage;
