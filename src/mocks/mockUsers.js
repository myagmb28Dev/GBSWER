// 학생 계정 임시 데이터
export const studentUser = {
  id: 'student001',
  name: '김민수',
  email: 'student001@gbsw.kr',
  role: 'student',
  grade: 2,
  class: 3,
  studentId: '2024001',
  profileImage: '/profile.png',
  phone: '010-1234-5678',
  joinDate: '2024-03-01'
};

// 선생님 계정 임시 데이터
export const teacherUser = {
  id: 'teacher001',
  name: '이영희',
  email: 'teacher001@gbsw.kr',
  role: 'teacher',
  subject: '수학',
  grade: 2,
  class: 3,
  profileImage: '/profile.png',
  phone: '010-5555-1234',
  joinDate: '2018-03-01'
};

// 관리자 계정 임시 데이터
export const adminUser = {
  id: 'admin001',
  name: '홍길동',
  email: 'admin001@gbsw.kr',
  role: 'admin',
  department: '교무처',
  position: '교감',
  profileImage: '/profile.png',
  phone: '010-9876-5432',
  joinDate: '2020-01-15'
};

// 로그인 사용자 정보 (역할별)
export const getMockUserByRole = (role) => {
  switch (role) {
    case 'admin':
      return adminUser;
    case 'teacher':
      return teacherUser;
    default:
      return studentUser;
  }
};
