package com.example.gbswer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "school_events", indexes = {
    @Index(name = "idx_event_date", columnList = "event_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "event_name", nullable = false, length = 200)
    private String eventName;

    @Column(name = "event_content", columnDefinition = "TEXT")
    private String eventContent;

    @Column(name = "event_type", length = 50)
    private String eventType; // 공휴일, 휴업일, 해당없음 등

    @Column(name = "one_grade_yn", length = 1)
    private String oneGradeYn;

    @Column(name = "two_grade_yn", length = 1)
    private String twoGradeYn;

    @Column(name = "three_grade_yn", length = 1)
    private String threeGradeYn;
}
