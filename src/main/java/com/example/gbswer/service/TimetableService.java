package com.example.gbswer.service;

import com.example.gbswer.dto.NeisTimetableApiResponse;
import com.example.gbswer.dto.TimetableDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimetableService {

    private final RestTemplate restTemplate;

    @Value("${neis.api.key}")
    private String apiKey;

    @Value("${neis.api.atpt-code}")
    private String atptCode;

    @Value("${neis.api.school-code}")
    private String schoolCode;

    @Value("${neis.api.timetable-url}")
    private String timetableUrl;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final int DEFAULT_DAYS = 7;
    private static final int PAGE_SIZE = 100;

    private int getOfficialClass(String department, int displayClass) {
        return switch (department) {
            case "소프트웨어개발과" -> displayClass;
            case "인공지능소프트웨어과", "게임개발과" -> 1;
            default -> displayClass;
        };
    }

    private String calculateCurrentSemester() {
        int month = LocalDate.now().getMonthValue();
        return (month >= 3 && month <= 8) ? "1" : "2";
    }

    public TimetableDto getDailyTimetable(String date, String department, String grade, String displayClass, String semester) {
        String actualSemester = (semester != null) ? semester : calculateCurrentSemester();
        int officialClass = getOfficialClass(department, Integer.parseInt(displayClass));

        log.info("하루치 시간표 조회 - 날짜: {}, 학과: {}, 학년: {}, 반: {} → {}, 학기: {}",
                date, department, grade, displayClass, officialClass, actualSemester);

        NeisTimetableApiResponse response = callNeisApi(date, date, department, grade, String.valueOf(officialClass), actualSemester);
        List<TimetableDto> timetables = convertToDto(response);

        return timetables.stream()
                .filter(t -> t.getDate().equals(date))
                .findFirst()
                .orElse(createEmptyTimetable(date));
    }

    public List<TimetableDto> getWeeklyTimetable(String startDate, Integer days, String department, String grade, String displayClass, String semester) {
        LocalDate start = (startDate != null) ? LocalDate.parse(startDate, DATE_FORMATTER) : LocalDate.now();
        int queryDays = (days != null) ? days : DEFAULT_DAYS;
        LocalDate end = start.plusDays(queryDays - 1);
        String actualSemester = (semester != null) ? semester : calculateCurrentSemester();
        int officialClass = getOfficialClass(department, Integer.parseInt(displayClass));

        log.info("기간별 시간표 조회 - 기간: {} ~ {}, 학과: {}, 학년: {}, 반: {} → {}, 학기: {}",
                start, end, department, grade, displayClass, officialClass, actualSemester);

        String fromDate = start.format(DATE_FORMATTER);
        String toDate = end.format(DATE_FORMATTER);

        NeisTimetableApiResponse response = callNeisApi(fromDate, toDate, department, grade, String.valueOf(officialClass), actualSemester);
        return convertToDto(response);
    }

    private NeisTimetableApiResponse callNeisApi(String fromDate, String toDate, String department, String grade, String className, String semester) {
        String url = UriComponentsBuilder.fromHttpUrl(timetableUrl)
                .queryParam("KEY", apiKey)
                .queryParam("Type", "json")
                .queryParam("ATPT_OFCDC_SC_CODE", atptCode)
                .queryParam("SD_SCHUL_CODE", schoolCode)
                .queryParam("pIndex", 1)
                .queryParam("pSize", PAGE_SIZE)
                .queryParam("SEM", semester)
                .queryParam("DDDEP_NM", department)
                .queryParam("GRADE", grade)
                .queryParam("CLASS_NM", className)
                .queryParam("TI_FROM_YMD", fromDate)
                .queryParam("TI_TO_YMD", toDate)
                .toUriString();

        try {
            NeisTimetableApiResponse response = restTemplate.getForObject(url, NeisTimetableApiResponse.class);
            if (response == null || response.getHisTimetable() == null) {
                return new NeisTimetableApiResponse();
            }
            return response;
        } catch (Exception e) {
            log.error("NEIS API 호출 오류", e);
            return new NeisTimetableApiResponse();
        }
    }

    private List<TimetableDto> convertToDto(NeisTimetableApiResponse response) {
        if (response == null || response.getHisTimetable() == null || response.getHisTimetable().isEmpty()) {
            return Collections.emptyList();
        }

        List<NeisTimetableApiResponse.TimetableRow> rows = response.getHisTimetable().stream()
                .filter(block -> block.getRow() != null)
                .flatMap(block -> block.getRow().stream())
                .collect(Collectors.toList());

        if (rows.isEmpty()) return Collections.emptyList();

        Map<String, List<NeisTimetableApiResponse.TimetableRow>> groupedByDate = rows.stream()
                .collect(Collectors.groupingBy(NeisTimetableApiResponse.TimetableRow::getAllTiYmd));

        return groupedByDate.entrySet().stream()
                .map(entry -> {
                    String date = entry.getKey();
                    List<TimetableDto.PeriodInfo> periods = entry.getValue().stream()
                            .map(row -> TimetableDto.PeriodInfo.builder()
                                    .period(Integer.parseInt(row.getPerio()))
                                    .subjectName(row.getItrtCntnt())
                                    .build())
                            .sorted(Comparator.comparing(TimetableDto.PeriodInfo::getPeriod))
                            .collect(Collectors.toList());

                    return TimetableDto.builder()
                            .date(date)
                            .dayOfWeek(getDayOfWeek(date))
                            .periods(periods)
                            .build();
                })
                .sorted(Comparator.comparing(TimetableDto::getDate))
                .collect(Collectors.toList());
    }

    private String getDayOfWeek(String date) {
        try {
            LocalDate localDate = LocalDate.parse(date, DATE_FORMATTER);
            return switch (localDate.getDayOfWeek()) {
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
}
