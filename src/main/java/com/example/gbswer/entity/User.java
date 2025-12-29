package com.example.gbswer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = true, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name = "bio")
    private String bio;

    @Column(nullable = true)
    private String major;

    @Column(nullable = true)
    private Integer grade;

    @Column(name = "class_number", nullable = true)
    private Integer classNumber;

    @Column(name = "student_number")
    private Integer studentNumber;

    @Column(name = "access_token", length = 512)
    private String accessToken;

    @Column(name = "refresh_token", length = 512)
    private String refreshToken;

    @Column(name = "admission_year")
    private Integer admissionYear;

    public enum Role {
        STUDENT, TEACHER, ADMIN
    }
}
