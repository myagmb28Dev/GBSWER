package com.example.gbswer.service;

import com.example.gbswer.config.properties.NeisProperties;
import com.example.gbswer.dto.NeisScheduleApiResponse;
import com.example.gbswer.dto.SchoolEventDto;
import com.example.gbswer.entity.SchoolEvent;
import com.example.gbswer.repository.SchoolEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolEventService {

    private final SchoolEventRepository schoolEventRepository;
    private final RestTemplate restTemplate;
    private final NeisProperties neisProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();


    private static final DateTimeFormatter NEIS_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter RESPONSE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public List<SchoolEventDto> getMonthlyEvents(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        // 오직 DB에서만 조회, NEIS API 호출 제거
        List<SchoolEvent> events = schoolEventRepository.findByEventDateBetweenOrderByEventDateAsc(startDate, endDate);
        return convertToEventDtoList(events);
    }

    @Transactional
    public void fetchAndSaveEventsFromNeis(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        String url = String.format(
            "%s?KEY=%s&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=%s&SD_SCHUL_CODE=%s&AA_FROM_YMD=%s&AA_TO_YMD=%s",
            neisProperties.getScheduleUrl(), neisProperties.getKey(), neisProperties.getAtptCode(), neisProperties.getSchoolCode(),
            startDate.format(NEIS_DATE_FORMAT), endDate.format(NEIS_DATE_FORMAT)
        );


        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            String responseBody = response.getBody();

            if (responseBody == null || responseBody.isEmpty() ||
                responseBody.trim().startsWith("<!DOCTYPE") || responseBody.trim().startsWith("<HTML")) {
                return;
            }

            NeisScheduleApiResponse body = objectMapper.readValue(responseBody, NeisScheduleApiResponse.class);
            if (body == null || body.getSchoolSchedule() == null || body.getSchoolSchedule().isEmpty()) {
                return;
            }

            List<NeisScheduleApiResponse.Row> rows = new ArrayList<>();
            for (NeisScheduleApiResponse.SchoolScheduleInfo info : body.getSchoolSchedule()) {
                if (info.getRow() != null) {
                    rows.addAll(info.getRow());
                }
            }

            if (rows.isEmpty()) {
                return;
            }

            for (NeisScheduleApiResponse.Row row : rows) {
                saveEventFromRow(row);
            }


        } catch (Exception e) {

        }
    }

    private void saveEventFromRow(NeisScheduleApiResponse.Row row) {
        try {
            LocalDate eventDate = LocalDate.parse(row.getAaYmd(), NEIS_DATE_FORMAT);
            String eventName = row.getEventNm();

            if (schoolEventRepository.findByEventDateAndEventName(eventDate, eventName).isPresent()) {
                return;
            }

            SchoolEvent event = SchoolEvent.builder()
                .eventDate(eventDate)
                .eventName(eventName)
                .eventContent(row.getEventCntnt())
                .eventType(row.getSbtrDdScNm())
                .oneGradeYn(row.getOneGradeEventYn())
                .twoGradeYn(row.getTwGradeEventYn())
                .threeGradeYn(row.getThreeGradeEventYn())
                .build();

            schoolEventRepository.save(event);
        } catch (Exception e) {
        }
    }

    private List<SchoolEventDto> convertToEventDtoList(List<SchoolEvent> events) {
        return events.stream()
            .map(event -> SchoolEventDto.builder()
                .id(event.getId())
                .date(event.getEventDate().format(RESPONSE_DATE_FORMAT))
                .eventName(event.getEventName())
                .eventContent(event.getEventContent())
                .eventType(event.getEventType())
                .oneGradeYn(event.getOneGradeYn())
                .twoGradeYn(event.getTwoGradeYn())
                .threeGradeYn(event.getThreeGradeYn())
                .build())
            .collect(Collectors.toList());
    }
}
