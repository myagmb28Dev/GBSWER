package com.example.gbswer.service;

import com.example.gbswer.config.properties.NeisProperties;
import com.example.gbswer.dto.DayMealsDto;
import com.example.gbswer.dto.MealDto;
import com.example.gbswer.dto.NeisApiResponse;
import com.example.gbswer.entity.Meal;
import com.example.gbswer.repository.MealRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository mealRepository;
    private final RestTemplate restTemplate;
    private final NeisProperties neisProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();


    private static final DateTimeFormatter NEIS_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter RESPONSE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public Map<String, DayMealsDto> getMonthlyMeals(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        List<Meal> meals = mealRepository.findByMealDateBetweenOrderByMealDateAscMealTypeAsc(startDate, endDate);

        // NEIS API 호출 제거: 값이 없으면 빈 결과만 반환
        return convertToMonthlyResponse(meals);
    }

    @Transactional
    public void fetchAndSaveMealsFromNeis(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        String url = String.format(
            "%s?KEY=%s&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=%s&SD_SCHUL_CODE=%s&MLSV_FROM_YMD=%s&MLSV_TO_YMD=%s",
            neisProperties.getUrl(), neisProperties.getKey(), neisProperties.getAtptCode(), neisProperties.getSchoolCode(),
            startDate.format(NEIS_DATE_FORMAT), endDate.format(NEIS_DATE_FORMAT)
        );

        log.info("NEIS API 호출: {}", url.replace(neisProperties.getKey(), "***"));

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            String responseBody = response.getBody();

            if (responseBody == null || responseBody.isEmpty() ||
                responseBody.trim().startsWith("<!DOCTYPE") || responseBody.trim().startsWith("<HTML")) {
                log.warn("NEIS API 응답이 유효하지 않습니다.");
                return;
            }

            NeisApiResponse body = objectMapper.readValue(responseBody, NeisApiResponse.class);
            if (body == null || body.getMealServiceDietInfo() == null || body.getMealServiceDietInfo().isEmpty()) {
                log.warn("NEIS API 응답에 mealServiceDietInfo가 없습니다.");
                return;
            }

            List<NeisApiResponse.Row> rows = null;
            for (NeisApiResponse.MealServiceDietInfo info : body.getMealServiceDietInfo()) {
                if (info.getRow() != null && !info.getRow().isEmpty()) {
                    rows = info.getRow();
                    break;
                }
            }

            if (rows == null || rows.isEmpty()) {
                log.warn("NEIS API row 데이터가 없습니다.");
                return;
            }

            log.info("NEIS API에서 {}건의 급식 데이터를 받았습니다.", rows.size());

            int savedCount = 0;
            for (NeisApiResponse.Row row : rows) {
                try {
                    LocalDate mealDate = LocalDate.parse(row.getMlsvYmd(), NEIS_DATE_FORMAT);
                    String mealType = convertMealType(row.getMmealScNm());

                    if (mealRepository.findByMealDateAndMealType(mealDate, mealType).isPresent()) {
                        continue;
                    }

                    String dishes = row.getDdishNm();
                    if (dishes != null) {
                        dishes = dishes.replaceAll("<br/>", "\n").trim();
                    }

                    Meal meal = Meal.builder()
                        .mealDate(mealDate)
                        .mealType(mealType)
                        .dishes(dishes)
                        .calorie(row.getCalInfo())
                        .originData(row.getDdishNm())
                        .build();

                    mealRepository.save(meal);
                    savedCount++;
                } catch (Exception e) {
                    log.error("급식 데이터 저장 중 오류: {}", e.getMessage());
                }
            }

            log.info("NEIS API 데이터 저장 완료: {}-{}, 저장된 데이터: {}건", year, month, savedCount);

        } catch (Exception e) {
            log.error("NEIS API 호출 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    private String convertMealType(String mmealScNm) {
        if (mmealScNm == null) return "UNKNOWN";
        return switch (mmealScNm.trim()) {
            case "조식" -> "BREAKFAST";
            case "중식" -> "LUNCH";
            case "석식" -> "DINNER";
            default -> "UNKNOWN";
        };
    }

    private Map<String, DayMealsDto> convertToMonthlyResponse(List<Meal> meals) {
        Map<String, DayMealsDto> result = new LinkedHashMap<>();

        Map<LocalDate, List<Meal>> groupedByDate = meals.stream()
            .collect(Collectors.groupingBy(Meal::getMealDate));

        groupedByDate.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(entry -> {
                LocalDate date = entry.getKey();
                List<Meal> dayMeals = entry.getValue();
                DayMealsDto dayMealsDto = DayMealsDto.builder().build();

                for (Meal meal : dayMeals) {
                    MealDto mealDto = MealDto.builder()
                        .mealType(meal.getMealType())
                        .dishes(parseDishes(meal.getDishes()))
                        .calorie(meal.getCalorie())
                        .build();

                    switch (meal.getMealType()) {
                        case "BREAKFAST" -> dayMealsDto.setBreakfast(mealDto);
                        case "LUNCH" -> dayMealsDto.setLunch(mealDto);
                        case "DINNER" -> dayMealsDto.setDinner(mealDto);
                    }
                }

                result.put(date.format(RESPONSE_DATE_FORMAT), dayMealsDto);
            });

        return result;
    }

    private List<String> parseDishes(String dishes) {
        if (dishes == null || dishes.isEmpty()) return Collections.emptyList();
        return Arrays.stream(dishes.split("\n"))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toList());
    }
}
