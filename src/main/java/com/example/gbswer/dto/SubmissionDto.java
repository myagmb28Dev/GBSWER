package com.example.gbswer.dto;

import com.example.gbswer.entity.Submission;
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
public class SubmissionDto {
    private Long id;
    private Long taskId;
    private String taskTitle;
    private Long studentId;
    private String studentName;
    private List<FileInfoDto> files;
    private LocalDateTime submittedAt;
    private String feedback;
    private Submission.SubmissionStatus status;
    private LocalDateTime reviewedAt;
}
