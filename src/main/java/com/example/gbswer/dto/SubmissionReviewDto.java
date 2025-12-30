package com.example.gbswer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionReviewDto {
    private String feedback;
    private String status; // "REVIEWED" or "APPROVED"
}
