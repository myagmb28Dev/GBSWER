package com.example.gbswer.repository;

import com.example.gbswer.entity.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    Page<Community> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT c FROM Community c WHERE c.major = :major OR c.major = 'ALL' ORDER BY c.createdAt DESC")
    Page<Community> findByMajorOrAllOrderByCreatedAtDesc(@Param("major") String major, Pageable pageable);

    Page<Community> findByMajorOrderByCreatedAtDesc(String major, Pageable pageable);
}
