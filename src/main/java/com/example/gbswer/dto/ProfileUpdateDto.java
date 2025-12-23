package com.example.gbswer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileUpdateDto {
    private String name;
    private String major;
    private Integer grade;
    private Integer classNumber;
    private Integer studentNumber;
    private String email;
}
