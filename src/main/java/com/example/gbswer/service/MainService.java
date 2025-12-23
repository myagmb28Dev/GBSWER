package com.example.gbswer.service;

import com.example.gbswer.dto.DashboardDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MainService {

    private final ScheduleService scheduleService;
    private final TaskService taskService;
    private final CommunityService communityService;

    public DashboardDto getDashboard(Long userId) {
        return DashboardDto.builder()
                .todaySchedules(scheduleService.getTodaySchedules(userId))
                .upcomingTasks(taskService.getUpcomingTasks())
                .recentNotices(communityService.getRecentNotices())
                .build();
    }
}
