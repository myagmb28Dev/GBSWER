import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get('/api/users');
        setUsers(res.data.data);
      } catch (err) {
        setUsers([]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  if (loading) return <div>유저 목록을 불러오는 중...</div>;

  return (
    <div className="user-list-container">
      <h2>전체 유저 목록</h2>
      <table className="user-list-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>이메일</th>
            <th>권한</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
