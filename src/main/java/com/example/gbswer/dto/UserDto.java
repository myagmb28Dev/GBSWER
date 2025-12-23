package com.example.gbswer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String major;
    private Integer grade;
    private Integer classNumber;
    private Integer studentNumber;
    private String role;
    private String userId;
    private String profileImage;
    private String bio;
    private Integer admissionYear;
}
