package com.example.gbswer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(length = 2000)
    private String feedback;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "file_names", columnDefinition = "TEXT")
    private String fileNames;

    @Column(name = "file_urls", columnDefinition = "TEXT")
    private String fileUrls;

    @PrePersist
    public void prePersist() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = SubmissionStatus.SUBMITTED;
        }
    }

    public enum SubmissionStatus {
        SUBMITTED,    // 제출됨
        REVIEWED,     // 검토 완료
        APPROVED      // 승인/확인 완료
    }
}
