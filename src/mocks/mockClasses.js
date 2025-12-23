// 테스트용 클래스 데이터
export const mockClasses = [
  {
    id: 1,
    className: "수학 1반",
    teacherName: "김선생님",
    classCode: "MATH123",
    participantCount: 28,
    assignmentDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2일 후
    createdAt: new Date(),
    participants: [
      { id: 1, name: "김민수", studentId: "2024001", profileImage: "/profile.png" },
      { id: 2, name: "이지은", studentId: "2024002", profileImage: "/profile.png" },
      { id: 3, name: "박준호", studentId: "2024003", profileImage: "/profile.png" },
      { id: 4, name: "최서연", studentId: "2024004", profileImage: "/profile.png" },
      { id: 5, name: "정우진", studentId: "2024005", profileImage: "/profile.png" },
      { id: 6, name: "한소영", studentId: "2024006", profileImage: "/profile.png" },
      { id: 7, name: "윤태현", studentId: "2024007", profileImage: "/profile.png" },
      { id: 8, name: "강민지", studentId: "2024008", profileImage: "/profile.png" },
      { id: 9, name: "조현우", studentId: "2024009", profileImage: "/profile.png" },
      { id: 10, name: "신예린", studentId: "2024010", profileImage: "/profile.png" },
      { id: 11, name: "오성민", studentId: "2024011", profileImage: "/profile.png" },
      { id: 12, name: "임수빈", studentId: "2024012", profileImage: "/profile.png" },
      { id: 13, name: "배준영", studentId: "2024013", profileImage: "/profile.png" },
      { id: 14, name: "송하늘", studentId: "2024014", profileImage: "/profile.png" },
      { id: 15, name: "홍지민", studentId: "2024015", profileImage: "/profile.png" },
      { id: 16, name: "노예진", studentId: "2024016", profileImage: "/profile.png" },
      { id: 17, name: "서동현", studentId: "2024017", profileImage: "/profile.png" },
      { id: 18, name: "김나연", studentId: "2024018", profileImage: "/profile.png" },
      { id: 19, name: "이준석", studentId: "2024019", profileImage: "/profile.png" },
      { id: 20, name: "박소희", studentId: "2024020", profileImage: "/profile.png" },
      { id: 21, name: "최민호", studentId: "2024021", profileImage: "/profile.png" },
      { id: 22, name: "정수연", studentId: "2024022", profileImage: "/profile.png" },
      { id: 23, name: "한준우", studentId: "2024023", profileImage: "/profile.png" },
      { id: 24, name: "윤서진", studentId: "2024024", profileImage: "/profile.png" },
      { id: 25, name: "강태민", studentId: "2024025", profileImage: "/profile.png" },
      { id: 26, name: "조예은", studentId: "2024026", profileImage: "/profile.png" },
      { id: 27, name: "신동혁", studentId: "2024027", profileImage: "/profile.png" },
      { id: 28, name: "임채원", studentId: "2024028", profileImage: "/profile.png" }
    ],
    posts: [
      { id: 1, title: "중간고사 범위 안내", type: "공지", date: "2024-12-20" },
      { id: 2, title: "미적분 과제 제출", type: "과제", date: "2024-12-19", deadline: "2024-12-24", submitted: false }, // D-1
      { id: 3, title: "수학 경시대회 참가 안내", type: "공지", date: "2024-12-18" },
      { id: 4, title: "함수 그래프 그리기 과제", type: "과제", date: "2024-12-17", deadline: "2024-12-27", submitted: false },
    ]
  },
  {
    id: 2,
    className: "영어 심화반",
    teacherName: "이선생님",
    classCode: "ENG456",
    participantCount: 22,
    assignmentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1일 후 (내일)
    createdAt: new Date(),
    posts: [
      { id: 5, title: "영어 에세이 작성법", type: "공지", date: "2024-12-20" },
      { id: 6, title: "토익 모의고사 과제", type: "과제", date: "2024-12-19", deadline: "2024-12-23", submitted: false }, // D-Day
      { id: 7, title: "영어 발표 일정 변경", type: "공지", date: "2024-12-18" },
      { id: 8, title: "단어 암기 과제", type: "과제", date: "2024-12-16", deadline: "2024-12-26", submitted: false },
    ]
  },
  {
    id: 3,
    className: "과학 실험반",
    teacherName: "박선생님",
    classCode: "SCI789",
    participantCount: 30,
    assignmentDeadline: null, // 과제 없음 (모두 제출 완료)
    createdAt: new Date(),
    posts: [
      { id: 9, title: "실험실 안전 수칙", type: "공지", date: "2024-12-20" },
      { id: 10, title: "화학 실험 보고서", type: "과제", date: "2024-12-19", deadline: "2024-12-22", submitted: true },
      { id: 11, title: "과학 박람회 참가 신청", type: "공지", date: "2024-12-17" },
      { id: 12, title: "물리 법칙 정리 과제", type: "과제", date: "2024-12-15", deadline: "2024-12-21", submitted: true },
    ]
  },
  {
    id: 4,
    className: "국어 문학반",
    teacherName: "최선생님",
    classCode: "KOR012",
    participantCount: 25,
    assignmentDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
    createdAt: new Date(),
    posts: [
      { id: 13, title: "고전 문학 작품 분석", type: "과제", date: "2024-12-20", deadline: "2024-12-28", submitted: false }, // D-5
      { id: 14, title: "시 낭송 대회 안내", type: "공지", date: "2024-12-19" },
      { id: 15, title: "독서 감상문 작성", type: "과제", date: "2024-12-18", deadline: "2024-12-30", submitted: false },
      { id: 16, title: "수업 교재 변경 안내", type: "공지", date: "2024-12-16" },
    ]
  },
  {
    id: 5,
    className: "사회 탐구반",
    teacherName: "정선생님",
    classCode: "SOC345",
    participantCount: 18,
    assignmentDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
    createdAt: new Date(),
    posts: [
      { id: 17, title: "역사 연표 만들기", type: "과제", date: "2024-12-20", deadline: "2024-12-26", submitted: false }, // D-3
      { id: 18, title: "현장 학습 일정 안내", type: "공지", date: "2024-12-19" },
      { id: 19, title: "지리 지도 그리기 과제", type: "과제", date: "2024-12-17", deadline: "2024-12-29", submitted: false },
      { id: 20, title: "사회 탐구 발표회", type: "공지", date: "2024-12-15" },
    ]
  },
  {
    id: 6,
    className: "체육 실기반",
    teacherName: "강선생님",
    classCode: "PE678",
    participantCount: 35,
    assignmentDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
    createdAt: new Date(),
    posts: [
      { id: 21, title: "체력 측정 일정", type: "공지", date: "2024-12-20" },
      { id: 22, title: "운동 일지 작성", type: "과제", date: "2024-12-19", deadline: "2024-12-30", submitted: false }, // D-7
      { id: 23, title: "체육 대회 참가 신청", type: "공지", date: "2024-12-18" },
      { id: 24, title: "스포츠 규칙 정리", type: "과제", date: "2024-12-16", deadline: "2025-01-02", submitted: false },
    ]
  },
  {
    id: 7,
    className: "음악 이론반",
    teacherName: "윤선생님",
    classCode: "MUS901",
    participantCount: 20,
    assignmentDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6일 후
    createdAt: new Date(),
    posts: [
      { id: 25, title: "음계 연습 과제", type: "과제", date: "2024-12-20", deadline: "2024-12-29", submitted: false }, // D-6
      { id: 26, title: "음악회 연주 곡목", type: "공지", date: "2024-12-19" },
      { id: 27, title: "악기 연주 녹음 과제", type: "과제", date: "2024-12-17", deadline: "2025-01-05", submitted: false },
      { id: 28, title: "음악실 이용 규칙", type: "공지", date: "2024-12-15" },
    ]
  }
];

// 학생이 참여한 클래스 (예시)
export const studentClasses = [
  mockClasses[0], // 수학 1반
  mockClasses[1], // 영어 심화반
  mockClasses[2], // 과학 실험반
  mockClasses[3], // 국어 문학반
  mockClasses[4], // 사회 탐구반
  mockClasses[5], // 체육 실기반
  mockClasses[6]  // 음악 이론반
];

// 관리자가 생성한 클래스 (예시)
export const adminClasses = [
  mockClasses[3], // 국어 문학반
  mockClasses[4], // 사회 탐구반
  mockClasses[0], // 수학 1반
  mockClasses[1]  // 영어 심화반
];