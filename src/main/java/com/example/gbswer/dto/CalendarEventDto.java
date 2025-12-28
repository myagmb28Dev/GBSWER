package com.example.gbswer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarEventDto {
    private Long id;
    private String title;
    private String startDate;   // YYYY-MM-DD
    private String endDate;     // YYYY-MM-DD
    private String memo;
    private String category;    // 학교 / 개인
    private String color;       // hex
    private boolean showInSchedule;
    private Long userId; // 로그인 ID
}
