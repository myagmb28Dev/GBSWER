package com.example.gbswer.service;

import com.example.gbswer.config.properties.NeisProperties;
import com.example.gbswer.dto.CalendarEventDto;
import com.example.gbswer.entity.CalendarEvent;
import com.example.gbswer.entity.User;
import com.example.gbswer.repository.CalendarEventRepository;
import com.example.gbswer.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private static final DateTimeFormatter NEIS_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter RESPONSE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final String CATEGORY_SCHOOL = "학교";
    private static final String CATEGORY_PERSONAL = "개인";
    private static final String DEFAULT_SCHOOL_COLOR = "#FFDFBA";
    private static final String DEFAULT_PERSONAL_COLOR = "#E0BBE4";

    private final CalendarEventRepository calendarEventRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final NeisProperties neisProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<CalendarEventDto> getMonthly(Long userId, Integer year, Integer month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        return findVisibleEvents(userId, start, end);
    }

    public List<CalendarEventDto> getToday(Long userId) {
        LocalDate today = LocalDate.now();
        return findVisibleEvents(userId, today, today).stream()
                .filter(e -> CATEGORY_PERSONAL.equals(e.getCategory()))
                .collect(Collectors.toList());
    }

    @Transactional
    public CalendarEventDto createPersonal(Long userId, CalendarEventDto req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "title is required");
        }
        LocalDate start = parseRequiredDate(req.getStartDate());
        LocalDate end = parseOptionalDate(req.getEndDate(), start);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "user not found"));

        CalendarEvent event = createEvent(req, user, start, end);
        event.setColor(req.getColor() != null ? req.getColor() : getDefaultPersonalColor());
        calendarEventRepository.save(event);
        return toDto(event);
    }

    @Transactional
    public CalendarEventDto updateEvent(Long userId, Long eventId, CalendarEventDto req) {
        CalendarEvent event = calendarEventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "event not found"));

        if (CATEGORY_SCHOOL.equals(event.getCategory())) {
            throw new ResponseStatusException(FORBIDDEN, "school events are read-only");
        }
        if (event.getUser() == null || !event.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(FORBIDDEN, "not authorized");
        }

        LocalDate start = parseRequiredDate(req.getStartDate());
        LocalDate end = parseOptionalDate(req.getEndDate(), start);

        event.setTitle(req.getTitle());
        event.setStartDate(start);
        event.setEndDate(end);
        event.setMemo(req.getMemo());
        event.setColor(req.getColor() != null ? req.getColor() : DEFAULT_PERSONAL_COLOR);
        event.setShowInSchedule(req.isShowInSchedule());
        calendarEventRepository.save(event);
        return toDto(event);
    }

    @Transactional
    public void deleteEvent(Long userId, Long eventId) {
        CalendarEvent event = calendarEventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "event not found"));
        if (CATEGORY_SCHOOL.equals(event.getCategory())) {
            throw new ResponseStatusException(FORBIDDEN, "school events are read-only");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "user not found"));
        if (!User.Role.ADMIN.equals(user.getRole()) && (event.getUser() == null || !event.getUser().getId().equals(userId))) {
            throw new ResponseStatusException(FORBIDDEN, "not authorized");
        }
        calendarEventRepository.delete(event);
    }

    @Transactional
    public List<CalendarEventDto> refreshMonth(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        fetchSchoolEventsFromNeis(startDate, endDate);
        return findVisibleEvents(null, startDate, endDate);
    }

    private List<CalendarEventDto> findVisibleEvents(Long userId, LocalDate start, LocalDate end) {
        List<CalendarEvent> events = new ArrayList<>();

        List<CalendarEvent> schoolEvents = calendarEventRepository.findByStartDateBetween(start, end).stream()
                .filter(ev -> CATEGORY_SCHOOL.equals(ev.getCategory()))
                .collect(Collectors.toList());
        events.addAll(schoolEvents);

        if (userId != null) {
            List<CalendarEvent> personalEvents = calendarEventRepository.findByStartDateBetweenAndUserId(start, end, userId);
            events.addAll(personalEvents);
        }

        System.out.println("[INFO] userId: " + userId + ", 조회된 총 일정 수: " + events.size() + " (학교: " + schoolEvents.size() + ", 개인: " + (userId != null ? events.size() - schoolEvents.size() : 0) + ")");
        return events.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private CalendarEventDto toDto(CalendarEvent event) {
        return CalendarEventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .startDate(event.getStartDate().format(RESPONSE_DATE_FORMAT))
                .endDate(event.getEndDate().format(RESPONSE_DATE_FORMAT))
                .memo(event.getMemo())
                .category(event.getCategory())
                .color(event.getColor())
                .showInSchedule(event.isShowInSchedule())
                .userId(event.getUser() != null ? event.getUser().getId() : null)
                .build();
    }

    private LocalDate parseRequiredDate(String date) {
        try {
            return LocalDate.parse(date);
        } catch (Exception e) {
            throw new ResponseStatusException(BAD_REQUEST, "invalid date format, expected yyyy-MM-dd");
        }
    }

    private LocalDate parseOptionalDate(String date, LocalDate fallback) {
        if (date == null || date.isBlank()) return fallback;
        try {
            return LocalDate.parse(date);
        } catch (Exception e) {
            throw new ResponseStatusException(BAD_REQUEST, "invalid date format, expected yyyy-MM-dd");
        }
    }

    private CalendarEvent createEvent(CalendarEventDto req, User user, LocalDate start, LocalDate end) {
        return CalendarEvent.builder()
                .category(CATEGORY_PERSONAL)
                .title(req.getTitle())
                .startDate(start)
                .endDate(end)
                .memo(req.getMemo())
                .color(req.getColor() != null ? req.getColor() : DEFAULT_PERSONAL_COLOR)
                .showInSchedule(req.isShowInSchedule())
                .user(user)
                .build();
    }

    private void fetchSchoolEventsFromNeis(LocalDate startDate, LocalDate endDate) {
        String url = String.format(
                "%s?KEY=%s&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=%s&SD_SCHUL_CODE=%s&AA_FROM_YMD=%s&AA_TO_YMD=%s",
                neisProperties.getScheduleUrl(), neisProperties.getKey(), neisProperties.getAtptCode(), neisProperties.getSchoolCode(),
                startDate.format(NEIS_DATE_FORMAT), endDate.format(NEIS_DATE_FORMAT)
        );

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            String responseBody = response.getBody();
            if (responseBody == null || responseBody.isEmpty()
                    || responseBody.trim().startsWith("<!DOCTYPE") || responseBody.trim().startsWith("<HTML")) {
                return;
            }

            com.example.gbswer.dto.NeisScheduleApiResponse body =
                    objectMapper.readValue(responseBody, com.example.gbswer.dto.NeisScheduleApiResponse.class);
            if (body == null || body.getSchoolSchedule() == null || body.getSchoolSchedule().isEmpty()) {
                return;
            }

            List<com.example.gbswer.dto.NeisScheduleApiResponse.Row> rows = extractRows(body);

            for (com.example.gbswer.dto.NeisScheduleApiResponse.Row row : rows) {
                try {
                    LocalDate eventDate = LocalDate.parse(row.getAaYmd(), NEIS_DATE_FORMAT);
                    String title = row.getEventNm();
                    if (title == null || title.isBlank()) continue;

                    if (calendarEventRepository.findByCategoryAndTitleAndStartDate(CATEGORY_SCHOOL, title, eventDate).isPresent()) {
                        continue;
                    }

                    CalendarEvent event = CalendarEvent.builder()
                            .category(CATEGORY_SCHOOL)
                            .title(title)
                            .startDate(eventDate)
                            .endDate(eventDate)
                            .memo(row.getEventCntnt())
                            .color(DEFAULT_SCHOOL_COLOR)
                            .showInSchedule(true)
                            .source(row.getAaYmd() + "|" + row.getEventNm())
                            .build();
                    calendarEventRepository.save(event);
                } catch (Exception ignored) {
                }
            }
        } catch (Exception ignored) {
        }
    }

    private List<com.example.gbswer.dto.NeisScheduleApiResponse.Row> extractRows(com.example.gbswer.dto.NeisScheduleApiResponse body) {
        List<com.example.gbswer.dto.NeisScheduleApiResponse.Row> rows = new ArrayList<>();
        for (com.example.gbswer.dto.NeisScheduleApiResponse.SchoolScheduleInfo info : body.getSchoolSchedule()) {
            if (info.getRow() != null) {
                rows.addAll(info.getRow());
            }
        }
        return rows;
    }

    private String getDefaultPersonalColor() {
        return System.getProperty("default.personal.color", DEFAULT_PERSONAL_COLOR);
    }
}
