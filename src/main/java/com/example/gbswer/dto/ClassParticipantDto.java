package com.example.gbswer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassParticipantDto {
    private Long id;
    private Long classId;
    private Long studentId;
    private String studentName;
    private Integer studentNumber;
    private String profileImage;
    private LocalDateTime joinedAt;
}
