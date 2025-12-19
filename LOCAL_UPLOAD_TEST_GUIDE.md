# 로컬 업로드 테스트 가이드 (간단 명료)

이 문서는 로컬 테스트 환경에서 이미지 업로드 흐름을 빠르게 확인하고 프론트에 전달할 수 있도록 정리한 가이드입니다.

핵심 요약
- 서버는 파일을 실제로 저장하고 DB에는 파일의 접근 URL(문자열)만 JSON 배열로 저장합니다.
- 로컬 테스트 모드로 동작하려면 `FILE_STORAGE_TYPE=local` 설정을 사용합니다.
- 코드에서 파일 관련 설정은 `FileProperties`(`file.upload-dir`, `file.type`)로 관리됩니다.

---

빠른 체크리스트
- `spring.profiles.active=local` 또는 로컬에서 실행
- 프로젝트 루트에 `.env.local`이 있고 아래 값이 설정되어 있는지 확인
  - `FILE_STORAGE_TYPE=local`
  - `FILE_UPLOAD_DIR=uploads`
- 서버를 실행한 뒤 Postman/cURL로 API 호출

---

환경/프로퍼티 매핑 (현재 코드 기준)
- `.env.local` (or env):
  - FILE_UPLOAD_DIR → application.yml `file.upload-dir`
  - FILE_STORAGE_TYPE → application.yml `file.type`
- `application.yml` (유효값 예)
```yaml
file:
  upload-dir: ${FILE_UPLOAD_DIR}
  type: ${FILE_STORAGE_TYPE}
```
- Java에서 읽는 클래스: `com.example.gbswer.config.properties.FileProperties`
  - 사용 예: `fileProperties.getUploadDir()` / `fileProperties.getType()`

주의: 기본값은 `file.upload-dir=uploads`, `file.type=s3` 입니다.

---

엔드포인트 (테스트 대상)
- 게시글 생성 (이미지 포함)
  - POST /api/community/write
  - Content-Type: multipart/form-data
  - form-data 필드:
    - `title` (string) — 필수
    - `content` (string) — 필수
    - `department` (string) — 선택, 기본 `ALL`
    - `images` (file[]) — 선택

- 게시글 수정
  - PUT /api/community/{id} (multipart/form-data)
  - 추가 필드: `existingImageUrls` (삭제하지 않을 기존 URL 리스트)

- 게시글 조회
  - GET /api/community/{id}
  - 반환 DTO: `CommunityDto.imageUrls` (List<String>)

---

요청 예시 (Postman)
- POST http://localhost:8080/api/community/write
  - body → form-data
    - title: 테스트
    - content: 이미지 업로드 테스트
    - images: (파일 선택) semi.png

cURL 예시
```bash
curl -X POST "http://localhost:8080/api/community/write" \
  -H "Authorization: Bearer <토큰>" \
  -F "title=테스트 게시물" \
  -F "content=이미지 업로드 테스트" \
  -F "images=@/path/to/semi.png"
```

---

응답 예시 (성공)
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "테스트 게시물",
    "content": "...",
    "imageUrls": [
      "http://localhost:8080/uploads/posts/2025/12/uuid1.jpg",
      "http://localhost:8080/uploads/posts/2025/12/uuid2.png"
    ]
  }
}
```
- 프론트는 `data.imageUrls` 배열을 `<img src="{url}">`로 렌더링하면 됩니다.

---

DB 저장 (정확한 위치)
- DB: MySQL (application 설정에 따라 연결)
- 테이블: `community`
- 컬럼: `image_urls` (TEXT)
  - 저장 형태: JSON 배열 문자열
  - 예: `['http://localhost:8080/uploads/...']`

참고: 파일 바이너리를 DB에 저장하지 않습니다.

---

서버 내부 동작 요약
1. `CommunityController.createPost()`에서 multipart 요청 수신
2. `CommunityService.createPost(...)` 호출
3. `uploadImagesWithRollback()` 내부에서 `file.type`을 확인
   - `local` → `FileUploadService.uploadCommunityImageLocal(file)` 호출 (로컬 파일 시스템에 저장)
   - `s3` → `FileUploadService.uploadCommunityImage(file)` 호출 (S3 업로드)
4. S3 또는 로컬에서 접근 가능한 URL을 반환
5. 반환된 URL 목록을 `Community.imageUrls`에 JSON 배열 문자열로 저장
6. DTO 변환 후 프론트에 반환

---

테스트 체크포인트 / 트러블슈팅
- 파일 업로드 후 응답에 URL이 없다면 서버 로그에서 예외 확인
- 업로드된 파일이 보이지 않으면 `file.upload-dir` 경로(absolute)를 확인
- URL로 접근 불가: 브라우저에서 URL 열기 및 WebConfig의 ResourceHandler(`/uploads/**`) 설정 확인
- 권한/인증 문제: Authorization 헤더 확인

---

간단한 스모크 테스트 (명령어)
```powershell
cd D:\Codes\GBSWER\Back
# 빌드
.\gradlew clean build
# 실행
.\gradlew bootRun
```
그 후 Postman/cURL로 업로드 테스트 실행.

---

변경하지 않은 코드 주의사항
- 코드 내부는 `FileProperties`로 설정을 읽도록 통일되어 있습니다. 문서의 예시는 현재 코드와 일치합니다.
- 운영 전환 시 `.env.local` 대신 운영 환경 변수나 CI/CD 시크릿에 `AWS` 키와 `FILE_STORAGE_TYPE=s3`를 설정하세요.

---

문서 업데이트 완료: `D:\Codes\GBSWER\Back\LOCAL_UPLOAD_TEST_GUIDE.md`
원하시면 이 문서를 더 간결한 한페이지 버전(프론트 전달용)으로 줄여드리겠습니다.
