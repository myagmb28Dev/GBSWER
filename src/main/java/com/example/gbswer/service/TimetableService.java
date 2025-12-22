package com.example.gbswer.service;

import com.example.gbswer.config.properties.NeisProperties;
import com.example.gbswer.dto.NeisTimetableApiResponse;
import com.example.gbswer.dto.TimetableDto;
import com.example.gbswer.entity.Timetable;
import com.example.gbswer.repository.TimetableRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimetableService {

    private final RestTemplate restTemplate;
    private final NeisProperties neisProperties;
    private final TimetableRepository timetableRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final int DEFAULT_DAYS = 7;

    public int getOfficialClass(String department, int displayClass) {
        if ("인공지능소프트웨어과".equals(department) || "게임개발과".equals(department)) {
            return 1;
        }
        return displayClass;
    }

    private String calculateCurrentSemester() {
        int month = LocalDate.now().getMonthValue();
        return (month >= 3 && month <= 8) ? "1" : "2";
    }

    // NEIS API 호출 통합 (하루/주간)
    private NeisTimetableApiResponse callNeisApi(String dateOrFrom, String toDate, String department, String grade, String classNm, String semester, boolean isPeriod) {
        String sem = (semester != null && !semester.isEmpty()) ? semester : calculateCurrentSemester();
        UriComponentsBuilder builder = UriComponentsBuilder.newInstance()
                .uri(URI.create(neisProperties.getTimetableUrl()))
                .queryParam("KEY", neisProperties.getKey())
                .queryParam("Type", "json")
                .queryParam("pIndex", 1)
                .queryParam("pSize", 50)
                .queryParam("ATPT_OFCDC_SC_CODE", neisProperties.getAtptCode())
                .queryParam("SD_SCHUL_CODE", neisProperties.getSchoolCode())
                .queryParam("SEM", sem)
                .queryParam("DDDEP_NM", department)
                .queryParam("GRADE", grade)
                .queryParam("CLASS_NM", classNm);
        if (isPeriod) {
            builder.queryParam("TI_FROM_YMD", dateOrFrom)
                   .queryParam("TI_TO_YMD", toDate);
        } else {
            builder.queryParam("ALL_TI_YMD", dateOrFrom);
        }
        String url = builder.build().toUriString();
        log.info("[타임테이블] NEIS API 요청 URL: {}", url);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            String responseBody = responseEntity.getBody();
            log.info("[타임테이블] NEIS API 원본 응답 JSON: {}", responseBody);
            if (responseBody == null || responseBody.isEmpty() ||
                responseBody.trim().startsWith("<!DOCTYPE") || responseBody.trim().startsWith("<HTML")) {
                log.warn("[타임테이블] NEIS API 응답이 유효하지 않습니다.");
                return new NeisTimetableApiResponse();
            }
            NeisTimetableApiResponse body = objectMapper.readValue(responseBody, NeisTimetableApiResponse.class);
            log.info("[타임테이블] 파싱 완료 - hisTimetable null? {}, size: {}",
                    body == null ? "null" : body.getHisTimetable() == null ? "null" : "not null",
                    body != null && body.getHisTimetable() != null ? body.getHisTimetable().size() : 0);
            if (body == null || body.getHisTimetable() == null || body.getHisTimetable().isEmpty()) {
                log.warn("[타임테이블] NEIS API 응답에 hisTimetable이 없습니다.");
                return new NeisTimetableApiResponse();
            }
            // 급식 API처럼 배열 순회하면서 row 찾기
            List<NeisTimetableApiResponse.TimetableRow> foundRows = null;
            for (NeisTimetableApiResponse.TimetableBlock block : body.getHisTimetable()) {
                if (block.getRow() != null && !block.getRow().isEmpty()) {
                    foundRows = block.getRow();
                    break;
                }
            }
            if (foundRows == null || foundRows.isEmpty()) {
                log.warn("[타임테이블] NEIS API 응답에 row 데이터가 없습니다.");
                return new NeisTimetableApiResponse();
            }
            log.info("[타임테이블] NEIS API 원본 응답 row 개수: {}", foundRows.size());
            return body;
        } catch (Exception e) {
            log.error("[타임테이블] NEIS API 호출 오류: {}", e.getMessage(), e);
            return new NeisTimetableApiResponse();
        }
    }

    // DB에서 기간별 시간표 조회 및 빈 TimetableDto 생성 유틸
    private List<TimetableDto> getTimetableFromDbOrEmpty(LocalDate start, LocalDate end, String department, int grade, int classInt) {
        List<Timetable> dbResult = timetableRepository.findByDateBetweenAndDepartmentAndGradeAndClassNumber(start, end, department, grade, classInt);
        if (!dbResult.isEmpty()) {
            Map<LocalDate, List<Timetable>> grouped = new HashMap<>();
            for (Timetable t : dbResult) {
                grouped.computeIfAbsent(t.getDate(), k -> new ArrayList<>()).add(t);
            }
            List<TimetableDto> dtos = new ArrayList<>();
            for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
                List<Timetable> list = grouped.getOrDefault(d, new ArrayList<>());
                dtos.add(convertEntityToDto(d, list));
            }
            return dtos;
        } else {
            List<TimetableDto> dtos = new ArrayList<>();
            for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
                dtos.add(createEmptyTimetable(d.format(DATE_FORMATTER)));
            }
            return dtos;
        }
    }

    public TimetableDto getDailyTimetable(String date, String department, String grade, String displayClass, String semester) {
        int gradeInt = Integer.parseInt(grade);
        int classInt = Integer.parseInt(displayClass);
        int officialClass = getOfficialClass(department, classInt);
        LocalDate localDate = LocalDate.parse(date, DATE_FORMATTER);

        // DB에서 먼저 조회
        List<Timetable> dbResult = timetableRepository.findByDateAndDepartmentAndGradeAndClassNumber(localDate, department, gradeInt, officialClass);
        if (!dbResult.isEmpty()) {
            log.info("[타임테이블] DB에서 조회 성공");
            return convertEntityToDto(localDate, dbResult);
        }

        log.info("[타임테이블] 하루치 시간표 조회 - 날짜: {}, 학과: {}, 학년: {}, 반: {} -> 공식반: {}", date, department, grade, displayClass, officialClass);

        NeisTimetableApiResponse response = callNeisApi(date, null, department, grade, String.valueOf(officialClass), semester, false);
        List<TimetableDto> timetables = convertToDto(response, gradeInt, officialClass);

        if (!timetables.isEmpty()) {
            saveTimetableEntities(timetables, department, gradeInt, officialClass);
            return timetables.stream()
                    .filter(t -> t.getDate().equals(date))
                    .findFirst()
                    .orElse(createEmptyTimetable(date));
        } else {
            return createEmptyTimetable(date);
        }
    }

    public List<TimetableDto> getWeeklyTimetable(String startDate, Integer days, String department, String grade, String displayClass, String semester) {
        LocalDate start = (startDate != null) ? LocalDate.parse(startDate, DATE_FORMATTER) : LocalDate.now();
        int queryDays = (days != null) ? days : DEFAULT_DAYS;
        LocalDate end = start.plusDays(queryDays - 1);
        int gradeInt = Integer.parseInt(grade);
        int classInt = Integer.parseInt(displayClass);
        int officialClass = getOfficialClass(department, classInt);

        // DB에서 먼저 조회 또는 빈 TimetableDto 생성
        List<TimetableDto> dbOrEmpty = getTimetableFromDbOrEmpty(start, end, department, gradeInt, officialClass);
        if (dbOrEmpty.stream().anyMatch(dto -> !dto.getPeriods().isEmpty())) {
            log.info("[타임테이블] DB에서 주간 시간표 조회 성공");
            return dbOrEmpty;
        }

        log.info("[타임테이블] 주간 시간표 조회 - 기간: {} ~ {}, 학과: {}, 학년: {}, 반: {} -> 공식반: {}", start, end, department, grade, displayClass, officialClass);

        String fromDate = start.format(DATE_FORMATTER);
        String toDate = end.format(DATE_FORMATTER);
        NeisTimetableApiResponse response = callNeisApi(fromDate, toDate, department, grade, String.valueOf(officialClass), semester, true);
        List<TimetableDto> allTimetables = convertToDto(response, gradeInt, officialClass);
        if (!allTimetables.isEmpty()) {
            saveTimetableEntities(allTimetables, department, gradeInt, officialClass);
            return allTimetables;
        } else {
            return getTimetableFromDbOrEmpty(start, end, department, gradeInt, officialClass);
        }
    }

    // 응답에서 특정 학년/반만 필터링해서 DTO로 변환
    private List<TimetableDto> convertToDto(NeisTimetableApiResponse response, int grade, int classNumber) {
        if (response == null || response.getHisTimetable() == null || response.getHisTimetable().isEmpty()) {
            log.warn("[타임테이블] NEIS API 응답에서 시간표 데이터 없음");
            return Collections.emptyList();
        }
        // 급식 API처럼 배열을 순회하면서 row가 있는 블록만 찾기
        List<NeisTimetableApiResponse.TimetableRow> rows = null;
        for (NeisTimetableApiResponse.TimetableBlock block : response.getHisTimetable()) {
            if (block.getRow() != null && !block.getRow().isEmpty()) {
                rows = block.getRow();
                break;
            }
        }
        if (rows == null || rows.isEmpty()) {
            log.warn("[타임테이블] NEIS API 응답에서 row 데이터 없음");
            return Collections.emptyList();
        }
        log.info("[타임테이블][DEBUG] 추출된 row 개수: {}, 필터 조건 - grade: {}, classNumber: {}", rows.size(), grade, classNumber);
        Map<String, List<NeisTimetableApiResponse.TimetableRow>> groupedByDate = rows.stream()
                .peek(row -> log.info("[타임테이블][DEBUG] row: grade={}, classNm={}, dddepNm={}, date={}", row.getGrade(), row.getClassNm(), row.getDddepNm(), row.getAllTiYmd()))
                .filter(row -> {
                    String rowGrade = row.getGrade() != null ? row.getGrade().trim() : "";
                    String rowClass = row.getClassNm() != null ? row.getClassNm().trim() : "";
                    boolean match = rowGrade.equals(String.valueOf(grade)) && rowClass.equals(String.valueOf(classNumber));
                    if (!match) {
                        log.warn("[타임테이블][DEBUG] 필터링 미스: rowGrade={}, rowClass={}, 기대값: grade={}, classNumber={}", rowGrade, rowClass, grade, classNumber);
                    }
                    return match;
                })
                .collect(Collectors.groupingBy(row -> row.getAllTiYmd() != null ? row.getAllTiYmd().trim() : ""));

        log.info("[타임테이블][DEBUG] 필터링 후 groupedByDate 크기: {}, 키: {}", groupedByDate.size(), groupedByDate.keySet());

        // 날짜별 TimetableDto 생성
        List<TimetableDto> result = new ArrayList<>();
        for (var entry : groupedByDate.entrySet()) {
            String date = entry.getKey();
            List<TimetableDto.PeriodInfo> periods = entry.getValue().stream()
                    .map(row -> TimetableDto.PeriodInfo.builder()
                            .period(Integer.parseInt(row.getPerio().trim()))
                            .subjectName(row.getItrtCntnt() != null ? row.getItrtCntnt().trim() : "")
                            .teacherName(null)
                            .classroomName(null)
                            .build())
                    .sorted(Comparator.comparing(TimetableDto.PeriodInfo::getPeriod))
                    .toList();
            result.add(TimetableDto.builder()
                    .date(date)
                    .dayOfWeek(getDayOfWeek(date))
                    .periods(periods)
                    .build());
        }
        result.sort(Comparator.comparing(TimetableDto::getDate));
        log.info("[타임테이블][DEBUG] 최종 TimetableDto 개수: {}", result.size());
        return result;
    }

    private String getDayOfWeek(String date) {
        try {
            return switch (LocalDate.parse(date, DATE_FORMATTER).getDayOfWeek()) {
                case MONDAY -> "월";
                case TUESDAY -> "화";
                case WEDNESDAY -> "수";
                case THURSDAY -> "목";
                case FRIDAY -> "금";
                case SATURDAY -> "토";
                case SUNDAY -> "일";
            };
        } catch (Exception e) {
            return "";
        }
    }

    private TimetableDto createEmptyTimetable(String date) {
        return TimetableDto.builder()
                .date(date)
                .dayOfWeek(getDayOfWeek(date))
                .periods(Collections.emptyList())
                .build();
    }

    private void saveTimetableEntities(List<TimetableDto> dtos, String department, int grade, int classNumber) {
        for (TimetableDto dto : dtos) {
            for (TimetableDto.PeriodInfo p : dto.getPeriods()) {
                timetableRepository.save(Timetable.builder()
                        .date(LocalDate.parse(dto.getDate(), DATE_FORMATTER))
                        .department(department)
                        .grade(grade)
                        .classNumber(classNumber)
                        .period(p.getPeriod())
                        .subjectName(p.getSubjectName())
                        .teacherName(p.getTeacherName())
                        .classroomName(p.getClassroomName())
                        .build());
            }
        }
    }

    private TimetableDto convertEntityToDto(LocalDate date, List<Timetable> entities) {
        List<TimetableDto.PeriodInfo> periods = entities.stream()
                .sorted(Comparator.comparing(Timetable::getPeriod))
                .map(e -> TimetableDto.PeriodInfo.builder()
                        .period(e.getPeriod())
                        .subjectName(e.getSubjectName())
                        .teacherName(e.getTeacherName())
                        .classroomName(e.getClassroomName())
                        .build())
                .toList();
        return TimetableDto.builder()
                .date(date.format(DATE_FORMATTER))
                .dayOfWeek(getDayOfWeek(date.format(DATE_FORMATTER)))
                .periods(periods)
                .build();
    }
}
