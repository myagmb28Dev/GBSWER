package com.example.gbswer.service;

import com.example.gbswer.config.properties.NeisProperties;
import com.example.gbswer.dto.DayMealsDto;
import com.example.gbswer.dto.MealDto;
import com.example.gbswer.entity.Meal;
import com.example.gbswer.repository.MealRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository mealRepository;
    private final RestTemplate restTemplate;
    private final NeisProperties neisProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PersistenceContext
    private EntityManager entityManager;

    private static final DateTimeFormatter NEIS_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter RESPONSE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Transactional(readOnly = true)
    public Map<String, DayMealsDto> getMonthlyMeals(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        List<Meal> meals = mealRepository.findByMealDateBetweenOrderByMealDateAscMealTypeAsc(startDate, endDate);

        return convertToMonthlyResponse(meals);
    }

    @Transactional
    public Map<String, DayMealsDto> refreshMonthlyMeals(int year, int month) {
        fetchAndSaveMealsFromNeis(year, month);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        List<Meal> meals = mealRepository.findByMealDateBetweenOrderByMealDateAscMealTypeAsc(startDate, endDate);
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


        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            String responseBody = response.getBody();

            if (responseBody == null || responseBody.isEmpty() ||
                responseBody.trim().startsWith("<!DOCTYPE") || responseBody.trim().startsWith("<HTML")) {
                return;
            }

            JsonNode root = objectMapper.readTree(responseBody);
            if (root == null) {
                return;
            }

            JsonNode arrayNode = root.get("mealServiceDietInfo");
            if (arrayNode == null || !arrayNode.isArray() || arrayNode.isEmpty()) {
                return;
            }

            JsonNode rowsNode = null;
            for (JsonNode infoNode : arrayNode) {
                if (infoNode.has("row") && infoNode.get("row").isArray() && !infoNode.get("row").isEmpty()) {
                    rowsNode = infoNode.get("row");
                    break;
                }
            }

            if (rowsNode == null || !rowsNode.isArray() || rowsNode.isEmpty()) {
                return;
            }

            int savedCount = 0;
            for (JsonNode row : rowsNode) {
                try {
                    String mlsvYmd = row.hasNonNull("MLSV_YMD") ? row.get("MLSV_YMD").asText() : null;
                    if (mlsvYmd == null || mlsvYmd.isBlank()) {
                        continue;
                    }

                    LocalDate mealDate = LocalDate.parse(mlsvYmd, NEIS_DATE_FORMAT);

                    String mmealScNm = row.hasNonNull("MMEAL_SC_NM") ? row.get("MMEAL_SC_NM").asText() : null;
                    String mealType = convertMealType(mmealScNm);

                    if (mealRepository.findByMealDateAndMealType(mealDate, mealType).isPresent()) {
                        continue;
                    }

                    String dishes = row.hasNonNull("DDISH_NM") ? row.get("DDISH_NM").asText() : null;
                    if (dishes != null) {
                        dishes = dishes.replaceAll("<br/>", "\n").trim();
                    }

                    String calInfo = row.hasNonNull("CAL_INFO") ? row.get("CAL_INFO").asText() : null;
                    String origin = row.hasNonNull("DDISH_NM") ? row.get("DDISH_NM").asText() : null;

                    Meal meal = Meal.builder()
                        .mealDate(mealDate)
                        .mealType(mealType)
                        .dishes(dishes)
                        .calorie(calInfo)
                        .originData(origin)
                        .build();

                    mealRepository.save(meal);
                    savedCount++;
                } catch (Exception e) {
                    System.err.println("[MealService] Meal 저장 중 예외 발생: " + e.getMessage());
                    e.printStackTrace();
                    entityManager.clear();
                }
            }


        } catch (Exception e) {
            System.err.println("[MealService] NEIS 급식 데이터 파싱/저장 전체 예외: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String convertMealType(String mmealScNm) {
        if (mmealScNm == null) return "LUNCH";
        return switch (mmealScNm) {
            case "조식" -> "BREAKFAST";
            case "중식" -> "LUNCH";
            case "석식" -> "DINNER";
            default -> "LUNCH";
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
        if (dishes == null) return Collections.emptyList();
        return Arrays.stream(dishes.split("\\n"))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();
    }
}
