package com.example.gbswer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassDto {
    private Long id;
    private String className;
    private String classCode;
    private Long teacherId;
    private String teacherName;
    private LocalDateTime createdAt;
    private Integer participantCount;
    private List<ClassParticipantDto> participants;
    private List<TaskDto> posts;
}
