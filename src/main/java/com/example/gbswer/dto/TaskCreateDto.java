package com.example.gbswer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskCreateDto {
    private String title;
    private String content;
    private String type;
    private LocalDate dueDate;
    private Long classId;
}
