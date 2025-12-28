package com.example.gbswer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDto {
    private List<CalendarEventDto> todaySchedules;
    private List<TaskDto> upcomingTasks;
    private List<CommunityDto> recentNotices;
}

