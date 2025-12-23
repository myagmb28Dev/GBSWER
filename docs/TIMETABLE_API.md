# GBSWER - Timetable API (프론트 전용)

요약
- 목적: 프론트엔드가 시간표를 올바르게 요청·처리하도록 하는 사용 설명서입니다.
- 핵심 원칙: "DB 우선 조회" + "NEIS 리프레시(외부 호출)는 명시적 요청" 방식입니다. 자동으로 NEIS를 호출하지 않습니다.

중요한 규칙(프론트는 반드시 준수)
- DB 조회용 GET 엔드포인트와 NEIS 호출용 POST(리프레시) 엔드포인트를 분리합니다.
- 프론트는 먼저 DB 조회(GET)를 호출해 데이터 유무를 확인하고, 데이터가 없을 때만 사용자가 명시적으로 리프레시를 트리거하도록 합니다.
- 모든 응답은 통일된 형식(status/message/data)을 사용합니다.

엔드포인트

1) GET /api/timetable
- 역할: DB에 이미 저장된 시간표(요청 기준 주 또는 단건)를 읽어 반환합니다. NEIS(외부) 호출은 하지 않습니다.
- 메서드: GET
- URL: /api/timetable
- 쿼리 파라미터(모두 필수)
  - date: 조회 기준 날짜, 형식 YYYYMMDD (예: 20251222)
  - major: 학과명(한글, 예: 게임개발과) — 서버가 NEIS 호출 시 인코딩 처리
  - grade: 학년 (숫자 or 문자열)
  - class: 반 (숫자 or 문자열)

- 동작(프론트 흐름)
  1. 프론트는 먼저 이 GET을 호출합니다.
  2. 응답이 200이면 응답의 data를 화면에 표시합니다.
  3. 응답이 404이면 "DB에 데이터 없음" 상태로 간주하고 사용자가 수동으로 리프레시(갱신)하도록 안내합니다.

- 성공 응답(200)
{
  "status": "OK",
  "message": null,
  "data": [ /* TimetableDto 배열 */ ]
}

- 데이터 없음(404)
{
  "status": "ERROR",
  "message": "DB에 시간표 데이터가 없습니다.",
  "data": null
}

- 서버 오류(500)
{
  "status": "ERROR",
  "message": "시간표 DB 조회 오류: 상세 메시지",
  "data": null
}

프론트 권장 처리
- 404(데이터 없음)일 때 자동으로 여러 번 리프레시를 요청하지 마세요. 사용자 확인(새로고침 버튼) 또는 백오프 로직 후 단일 리프레시 호출 권장.

2) POST /api/timetable/refresh-week
- 역할: 요청한 기준일을 포함하는 주(월~금, 서비스 정책에 따름) 범위를 NEIS에서 조회하여 DB에 저장(업데이트)한 뒤, 저장된 데이터를 반환합니다.
- 메서드: POST
- URL: /api/timetable/refresh-week
- 쿼리 파라미터(모두 필수)
  - date: 기준 날짜 YYYYMMDD (예: 20251222). 이 날짜가 포함되는 주 범위를 조회합니다.
  - major: 학과명(예: 게임개발과)
  - grade: 학년
  - class: 반 — 서버 내부에서 필요 시 '공식반'으로 매핑할 수 있습니다 (프론트는 원래 값을 보냅니다).

- 동작(프론트 흐름)
  1. 프론트는 DB에 데이터가 없거나 사용자가 수동으로 "갱신"을 요청할 때 이 POST를 호출합니다.
  2. 서버는 NEIS 호출 → 파싱 → DB에 저장(중복은 업데이트 처리) → 저장된 DB 결과를 반환합니다.
  3. 프론트는 반환된 데이터를 바로 사용합니다.

- 성공 응답(200)
{
  "status": "OK",
  "message": null,
  "data": [ /* 해당 주의 DB에 저장된 TimetableDto 목록 */ ]
}

- 잘못된 요청(400)
{
  "status": "ERROR",
  "message": "required parameter missing: date/major/grade/class",
  "data": null
}

- NEIS 호출 실패 또는 DB 저장 실패(500)
{
  "status": "ERROR",
  "message": "시간표 리프레시 오류: NEIS 호출 실패 또는 DB 저장 실패",
  "data": null
}

주의사항
- 이 API는 외부 NEIS 호출을 수행하므로 호출 빈도를 엄격히 제한하세요. 프론트는 사용자가 직접 트리거하는 UI(버튼)로만 호출하거나, 서버에서 허용 정책(쿼터)을 마련해 사용하는 것을 권장합니다.
- 서버는 학번/입학년도에 따라 내부적으로 "공식반" 매핑 로직을 적용할 수 있습니다(프론트는 변환하지 마세요).

공통 응답 형식
- 성공: { "status": "OK", "message": null, "data": <payload> }
- 실패: { "status": "ERROR", "message": "인간친화 메시지", "data": null }
- 데이터 없음 구분: 404로 응답하여 프론트가 명확히 판단할 수 있게 합니다.

타입/필드(프론트가 받는 데이터 예시)
- TimetableDto 항목 예시
  - date: string (YYYYMMDD)
  - grade: number
  - classNumber: number
  - period: number
  - subjectName: string
  - teacherName: string | null

요청 예시 (Axios)
// DB 조회
axios.get('/api/timetable', { params: { date: '20251222', major: '게임개발과', grade: '2', class: '4' } })

// NEIS 리프레시(수동)
axios.post('/api/timetable/refresh-week', null, { params: { date: '20251222', major: '게임개발과', grade: '2', class: '4' } })

프론트 구현 팁
- 중복 호출 방지: 새로고침 버튼 클릭 시 버튼 비활성화 후, 응답이 오면 재활성화.
- 캐싱: 동일 파라미터에 대해 짧은 기간(예: 5분) 메모리 캐시를 두고 재사용.
- 에러 분기: 403(인증) → 로그인/토큰 갱신, 404(데이터 없음) → 사용자에게 리프레시 유도, 500(서버 오류) → 재시도 안내.

변경 관리
- 서버 필드(예: teacherName 제거 등)가 바뀌면 이 문서를 업데이트하세요.

버전: 1.1
작성일: 2025-12-23
작성자: GBSWER 백엔드 팀 (프론트 전용)
