package com.example.gbswer.service;

import com.example.gbswer.dto.ScheduleCreateDto;
import com.example.gbswer.dto.ScheduleDto;
import com.example.gbswer.entity.Schedule;
import com.example.gbswer.entity.User;
import com.example.gbswer.repository.ScheduleRepository;
import com.example.gbswer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;

    public List<ScheduleDto> getSchedulesByMonth(Long userId, Integer year, Integer month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        return scheduleRepository.findByUserAndDueDateBetween(user, startDate, endDate).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ScheduleDto> getTodaySchedules(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));

        return scheduleRepository.findByUserAndDueDate(user, LocalDate.now()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ScheduleDto createSchedule(Long userId, ScheduleCreateDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));

        Schedule schedule = Schedule.builder()
                .user(user)
                .title(request.getTitle())
                .dueDate(request.getDueDate())
                .memo(request.getMemo())
                .build();

        scheduleRepository.save(schedule);
        return convertToDto(schedule);
    }

    @Transactional
    public ScheduleDto updateSchedule(Long scheduleId, Long userId, ScheduleCreateDto request) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "schedule not found"));

        if (!schedule.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }

        schedule.setTitle(request.getTitle());
        schedule.setDueDate(request.getDueDate());
        schedule.setMemo(request.getMemo());
        scheduleRepository.save(schedule);
        return convertToDto(schedule);
    }

    @Transactional
    public void deleteSchedule(Long scheduleId, Long userId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "schedule not found"));

        if (!schedule.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }

        scheduleRepository.delete(schedule);
    }

    private ScheduleDto convertToDto(Schedule schedule) {
        return ScheduleDto.builder()
                .id(schedule.getId())
                .title(schedule.getTitle())
                .dueDate(schedule.getDueDate())
                .memo(schedule.getMemo())
                .build();
    }
}
