package com.example.gbswer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "community", indexes = {
    @Index(name = "idx_community_major", columnList = "major")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 5000)
    private String content;

    @Column(nullable = false)
    private String writer;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(nullable = false)
    private Long viewCount = 0L;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @Builder.Default
    @Column(nullable = false)
    private String major = "ALL";

    @Column(name = "file_names", columnDefinition = "TEXT")
    private String fileNames;

    @Column(name = "file_urls", columnDefinition = "TEXT")
    private String fileUrls;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (viewCount == null) viewCount = 0L;
        if (major == null) major = "ALL";
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
