package com.example.gbswer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolEventDto {
    private Long id;
    private String date;
    private String eventName;
    private String eventContent;
    private String eventType;
    private String oneGradeYn;
    private String twoGradeYn;
    private String threeGradeYn;
}

