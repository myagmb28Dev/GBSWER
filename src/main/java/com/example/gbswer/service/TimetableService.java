package com.example.gbswer.service;

import com.example.gbswer.config.properties.NeisProperties;
import com.example.gbswer.dto.NeisTimetableApiResponse;
import com.example.gbswer.dto.TimetableDto;
import com.example.gbswer.entity.Timetable;
import com.example.gbswer.repository.TimetableRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final RestTemplate restTemplate;
    private final NeisProperties neisProperties;
    private final TimetableRepository timetableRepository;
    private final EntityManager entityManager;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");


    private final Map<String, Long> recentRequests = new java.util.concurrent.ConcurrentHashMap<>();
    private static final long REQUEST_TTL_MS = 30_000; // 30초

    public int getOfficialClass(String major, int displayClass) {
        if ("인공지능소프트웨어과".equals(major) || "게임개발과".equals(major)) {
            return 1;
        }
        return displayClass;
    }

    private NeisTimetableApiResponse callNeisApi(String fromDate, String toDate, String major, String grade, String classNm) {
        UriComponentsBuilder builder = UriComponentsBuilder.newInstance()
                .uri(URI.create(neisProperties.getTimetableUrl()))
                .queryParam("KEY", neisProperties.getKey())
                .queryParam("Type", "json")
                .queryParam("pIndex", 1)
                .queryParam("pSize", 100)
                .queryParam("ATPT_OFCDC_SC_CODE", neisProperties.getAtptCode())
                .queryParam("SD_SCHUL_CODE", neisProperties.getSchoolCode())
                .queryParam("DDDEP_NM", major)
                .queryParam("GRADE", grade)
                .queryParam("CLASS_NM", classNm);

        if (toDate != null && !toDate.isEmpty()) {
            builder.queryParam("TI_FROM_YMD", fromDate)
                   .queryParam("TI_TO_YMD", toDate);
        } else {
            builder.queryParam("ALL_TI_YMD", fromDate);
        }

        String url = builder.build().toUriString();
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            String responseBody = responseEntity.getBody();
            if (responseBody == null || responseBody.isEmpty()
                || responseBody.trim().startsWith("<!DOCTYPE") || responseBody.trim().startsWith("<HTML")) {
                return new NeisTimetableApiResponse();
            }
            NeisTimetableApiResponse body = objectMapper.readValue(responseBody, NeisTimetableApiResponse.class);
            if (body == null || body.getHisTimetable() == null || body.getHisTimetable().isEmpty()) {
                return new NeisTimetableApiResponse();
            }
            // 배열 순회하면서 row 찾기
            List<NeisTimetableApiResponse.TimetableRow> foundRows = null;
            for (NeisTimetableApiResponse.TimetableBlock block : body.getHisTimetable()) {
                if (block.getRow() != null && !block.getRow().isEmpty()) {
                    foundRows = block.getRow();
                    break;
                }
            }
            if (foundRows == null) {
                return new NeisTimetableApiResponse();
            }
            // 성공적으로 파싱된 응답 반환
            return body;
        } catch (Exception e) {
            return new NeisTimetableApiResponse();
        }
    }

    private List<TimetableDto> getTimetableFromDbOrEmpty(LocalDate start, LocalDate end, String major, int grade, int classInt) {
        List<Timetable> dbResult = timetableRepository.findByDateBetweenAndMajorAndGradeAndClassNumber(start, end, major, grade, classInt);
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


    @org.springframework.transaction.annotation.Transactional
    public List<TimetableDto> refreshWeeklyByDate(String date, String major, String grade, String displayClass) {
        LocalDate target = (date != null && !date.isEmpty()) ? LocalDate.parse(date, DATE_FORMATTER) : LocalDate.now();
        LocalDate start = target.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate end = start.plusDays(4); // 월~금

        String weekStart = start.format(DATE_FORMATTER);
        String reqKey = String.join("|", weekStart, major, grade, displayClass);
        long now = System.currentTimeMillis();

        recentRequests.entrySet().removeIf(entry -> (now - entry.getValue()) > REQUEST_TTL_MS);

        Long last = recentRequests.get(reqKey);
        if (last != null && (now - last) < REQUEST_TTL_MS) {
            int gradeInt = Integer.parseInt(grade);
            int classInt = Integer.parseInt(displayClass);
            int officialClass = getOfficialClass(major, classInt);
            return getTimetableFromDbOrEmpty(start, end, major, gradeInt, officialClass);
        }
        recentRequests.put(reqKey, now);

        // 기존 로직 계속 수행 (start/end 가 이미 계산되어 있음)
        int gradeInt = Integer.parseInt(grade);
        int classInt = Integer.parseInt(displayClass);
        int officialClass = getOfficialClass(major, classInt);

        String fromDate = start.format(DATE_FORMATTER);
        String toDate = end.format(DATE_FORMATTER);
        NeisTimetableApiResponse response = callNeisApi(fromDate, toDate, major, grade, String.valueOf(officialClass));
        List<TimetableDto> allTimetables = convertToDto(response, gradeInt, officialClass);
        if (!allTimetables.isEmpty()) {
            saveTimetableEntities(allTimetables, major, gradeInt, officialClass);
        } else {
            // 강제 리프레시 시 NEIS에서 데이터가 없습니다.
        }
        return getTimetableFromDbOrEmpty(start, end, major, gradeInt, officialClass);
    }

    // 응답에서 특정 학년/반만 필터링해서 DTO로 변환
    private List<TimetableDto> convertToDto(NeisTimetableApiResponse response, int grade, int classNumber) {
        if (response == null || response.getHisTimetable() == null || response.getHisTimetable().isEmpty()) {
            return Collections.emptyList();
        }
        // 배열을 순회하면서 row가 있는 블록만 찾기
        List<NeisTimetableApiResponse.TimetableRow> rows = null;
        for (NeisTimetableApiResponse.TimetableBlock block : response.getHisTimetable()) {
            if (block.getRow() != null && !block.getRow().isEmpty()) {
                rows = block.getRow();
                break;
            }
        }
        if (rows == null) {
            return Collections.emptyList();
        }

        Map<String, List<NeisTimetableApiResponse.TimetableRow>> groupedByDate = rows.stream()
                .filter(row -> {
                    String rowGrade = row.getGrade() != null ? row.getGrade().trim() : "";
                    String rowClass = row.getClassNm() != null ? row.getClassNm().trim() : "";
                    return rowGrade.equals(String.valueOf(grade)) && rowClass.equals(String.valueOf(classNumber));
                })
                .collect(Collectors.groupingBy(row -> row.getAllTiYmd() != null ? row.getAllTiYmd().trim() : ""));

        // 날짜별 TimetableDto 생성
        List<TimetableDto> result = new ArrayList<>();
        for (var entry : groupedByDate.entrySet()) {
            String date = entry.getKey();
            List<TimetableDto.PeriodInfo> periods = entry.getValue().stream()
                    .map(row -> TimetableDto.PeriodInfo.builder()
                            .period(Integer.parseInt(row.getPerio().trim()))
                            .subjectName(row.getItrtCntnt() != null ? row.getItrtCntnt().trim() : "")
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

    private void saveTimetableEntities(List<TimetableDto> dtos, String major, int grade, int classNumber) {
        if (dtos == null || dtos.isEmpty()) return;

        LocalDate minDate = dtos.stream()
                .map(d -> LocalDate.parse(d.getDate(), DATE_FORMATTER))
                .min(LocalDate::compareTo)
                .get();
        LocalDate maxDate = dtos.stream()
                .map(d -> LocalDate.parse(d.getDate(), DATE_FORMATTER))
                .max(LocalDate::compareTo)
                .get();

        List<Timetable> existing = timetableRepository.findByDateBetweenAndMajorAndGradeAndClassNumber(minDate, maxDate, major, grade, classNumber);
        Map<String, Timetable> existingMap = new HashMap<>();
        for (Timetable t : existing) {
            String key = t.getDate().format(DATE_FORMATTER) + "#" + t.getPeriod();
            existingMap.put(key, t);
        }

        List<Timetable> toSave = new ArrayList<>();

        for (TimetableDto dto : dtos) {
            LocalDate date = LocalDate.parse(dto.getDate(), DATE_FORMATTER);
            for (TimetableDto.PeriodInfo p : dto.getPeriods()) {
                String key = date.format(DATE_FORMATTER) + "#" + p.getPeriod();
                Timetable exist = existingMap.get(key);
                if (exist != null) {
                    exist.setSubjectName(p.getSubjectName());
                    toSave.add(exist);
                } else {
                    Timetable newT = Timetable.builder()
                            .date(date)
                            .major(major)
                            .grade(grade)
                            .classNumber(classNumber)
                            .period(p.getPeriod())
                            .subjectName(p.getSubjectName())
                            .build();
                    toSave.add(newT);
                }
            }
        }

        // Bulk save with exception handling for unique constraint race
        try {
            timetableRepository.saveAll(toSave);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // 중복 충돌 발생, 개별 처리로 폴백
            // 중요: 예외 발생 시 퍼시스턴스 컨텍스트가 불안정해질 수 있으므로 명시적으로 clear
            try {
                entityManager.clear();
            } catch (Exception emEx) {
            }
            for (Timetable t : toSave) {
                try {
                    timetableRepository.save(t);
                } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                    // 중복 삽입 충돌 발생(개별), 기존 레코드 업데이트로 전환
                    // 예외 시 세션 정리 후 재조회
                    try {
                        entityManager.clear();
                    } catch (Exception emEx) {
                    }
                    Timetable existingRecord = timetableRepository.findByDateAndMajorAndGradeAndClassNumber(t.getDate(), t.getMajor(), t.getGrade(), t.getClassNumber())
                            .stream()
                            .filter(r -> r.getPeriod() == t.getPeriod())
                            .findFirst()
                            .orElse(null);
                    if (existingRecord != null) {
                        existingRecord.setSubjectName(t.getSubjectName());
                        try {
                            timetableRepository.save(existingRecord);
                        } catch (Exception ex2) {
                        }
                    } else {
                        try {
                            timetableRepository.save(t);
                        } catch (Exception ex3) {
                        }
                    }
                }
            }
        }
    }

    private TimetableDto convertEntityToDto(LocalDate date, List<Timetable> entities) {
        List<TimetableDto.PeriodInfo> periods = entities.stream()
                .sorted(Comparator.comparing(Timetable::getPeriod))
                .map(e -> TimetableDto.PeriodInfo.builder()
                        .period(e.getPeriod())
                        .subjectName(e.getSubjectName())
                        .build())
                .toList();
        return TimetableDto.builder()
                .date(date.format(DATE_FORMATTER))
                .dayOfWeek(getDayOfWeek(date.format(DATE_FORMATTER)))
                .periods(periods)
                .build();
    }

    public List<TimetableDto> getWeeklyFromDb(String date, String major, String grade, String displayClass) {
        LocalDate target = (date != null && !date.isEmpty()) ? LocalDate.parse(date, DATE_FORMATTER) : LocalDate.now();
        LocalDate start = target.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate end = start.plusDays(4); // 월~금

        int gradeInt;
        int classInt;
        try {
            gradeInt = Integer.parseInt(grade);
            classInt = Integer.parseInt(displayClass);
        } catch (Exception e) {
            // 잘못된 파라미터는 빈 결과로 처리
            // 빈 주간 템플릿 반환
            List<TimetableDto> dtos = new ArrayList<>();
            for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
                dtos.add(createEmptyTimetable(d.format(DATE_FORMATTER)));
            }
            return dtos;
        }
        int officialClass = getOfficialClass(major, classInt);
        return getTimetableFromDbOrEmpty(start, end, major, gradeInt, officialClass);
    }

}
