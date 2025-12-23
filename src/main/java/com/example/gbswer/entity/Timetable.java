package com.example.gbswer.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "timetable", uniqueConstraints = {
        @UniqueConstraint(name = "uk_timetable_unique", columnNames = {"date", "major", "grade", "class_number", "period"})
})
public class Timetable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private String major;
    private int grade;

    @Column(name = "class_number")
    private int classNumber;

    private int period;
    private String subjectName;
}
