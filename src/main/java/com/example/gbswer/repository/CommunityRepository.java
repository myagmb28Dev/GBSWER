package com.example.gbswer.repository;

import com.example.gbswer.entity.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    List<Community> findAllByOrderByCreatedAtDesc();
    List<Community> findTop5ByOrderByCreatedAtDesc();

    // 학과별 게시글 조회 (해당 학과 + 전체 공개 게시글)
    @Query("SELECT c FROM Community c WHERE c.department = :department OR c.department = 'ALL' ORDER BY c.createdAt DESC")
    List<Community> findByDepartmentOrAllOrderByCreatedAtDesc(@Param("department") String department);

    // 특정 학과만 조회
    List<Community> findByDepartmentOrderByCreatedAtDesc(String department);

    // 학과별 최근 게시글 5개
    @Query("SELECT c FROM Community c WHERE c.department = :department OR c.department = 'ALL' ORDER BY c.createdAt DESC LIMIT 5")
    List<Community> findTop5ByDepartmentOrAllOrderByCreatedAtDesc(@Param("department") String department);
}

