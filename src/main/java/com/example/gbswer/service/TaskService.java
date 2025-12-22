package com.example.gbswer.service;

import com.example.gbswer.dto.TaskCreateDto;
import com.example.gbswer.dto.SubmissionDto;
import com.example.gbswer.dto.TaskDto;
import com.example.gbswer.dto.FileInfoDto;
import com.example.gbswer.entity.Submission;
import com.example.gbswer.entity.Task;
import com.example.gbswer.entity.User;
import com.example.gbswer.repository.SubmissionRepository;
import com.example.gbswer.repository.TaskRepository;
import com.example.gbswer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;

    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public TaskDto getTaskById(Long taskId) {
        return convertToDto(findTaskById(taskId));
    }

    @Transactional
    public TaskDto createTask(Long teacherId, TaskCreateDto request, List<MultipartFile> files) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "teacher not found"));

        List<String> fileUrls = new ArrayList<>();
        List<String> fileNames = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                String url = fileUploadService.uploadTaskFile(file);
                fileUrls.add(url);
                fileNames.add(file.getOriginalFilename());
            }
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .teacher(teacher)
                .teacherName(teacher.getName())
                .fileNames(convertListToJson(fileNames))
                .fileUrls(convertListToJson(fileUrls))
                .build();

        taskRepository.save(task);
        return convertToDto(task);
    }

    @Transactional
    public TaskDto updateTask(Long taskId, Long teacherId, TaskCreateDto request) {
        Task task = findTaskById(taskId);

        if (!task.getTeacher().getId().equals(teacherId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        taskRepository.save(task);
        return convertToDto(task);
    }

    @Transactional
    public SubmissionDto submitTask(Long taskId, Long studentId, List<MultipartFile> files) {
        Task task = findTaskById(taskId);
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "student not found"));

        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file is required");
        }

        List<String> fileUrls = new ArrayList<>();
        List<String> fileNames = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;
            String url = fileUploadService.uploadSubmissionFile(file);
            fileUrls.add(url);
            fileNames.add(file.getOriginalFilename());
        }

        Submission submission = submissionRepository.findByTaskAndStudent(task, student)
                .orElse(Submission.builder().task(task).student(student).build());

        if (submission.getFileNames() != null) {
            fileUploadService.deleteFiles(convertJsonToList(submission.getFileNames()));
        }

        submission.setFileNames(convertListToJson(fileNames));
        submission.setFileUrls(convertListToJson(fileUrls));
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus(Submission.SubmissionStatus.SUBMITTED);
        submission.setFeedback(null);
        submission.setReviewedAt(null);
        submissionRepository.save(submission);

        return convertSubmissionToDto(submission);
    }

    public List<SubmissionDto> getMySubmissions(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "student not found"));

        return submissionRepository.findByStudent(student).stream()
                .map(this::convertSubmissionToDto)
                .collect(Collectors.toList());
    }

    public List<SubmissionDto> getSubmissionsByTask(Long taskId) {
        Task task = findTaskById(taskId);
        return submissionRepository.findByTask(task).stream()
                .map(this::convertSubmissionToDto)
                .collect(Collectors.toList());
    }

    public SubmissionDto getSubmissionById(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "submission not found"));
        return convertSubmissionToDto(submission);
    }

    public List<TaskDto> getUpcomingTasks() {
        return taskRepository.findByDueDateAfter(LocalDate.now()).stream()
                .limit(5)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubmissionDto reviewSubmission(Long submissionId, String feedback, Submission.SubmissionStatus status) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "submission not found"));

        if (status != Submission.SubmissionStatus.REVIEWED && status != Submission.SubmissionStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid status");
        }

        submission.setFeedback(feedback);
        submission.setStatus(status);
        submission.setReviewedAt(LocalDateTime.now());
        submissionRepository.save(submission);

        return convertSubmissionToDto(submission);
    }

    @Transactional
    public void deleteTask(Long taskId, Long teacherId) {
        Task task = findTaskById(taskId);

        if (!task.getTeacher().getId().equals(teacherId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }

        if (task.getFileNames() != null) {
            fileUploadService.deleteFiles(convertJsonToList(task.getFileNames()));
        }

        List<Submission> submissions = submissionRepository.findByTask(task);
        for (Submission submission : submissions) {
            if (submission.getFileNames() != null) {
                fileUploadService.deleteFiles(convertJsonToList(submission.getFileNames()));
            }
        }

        taskRepository.delete(task);
    }

    private Task findTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "task not found"));
    }

    private List<FileInfoDto> buildFileInfoList(String fileUrlsJson, String fileNamesJson) {
        List<String> fileUrls = convertJsonToList(fileUrlsJson);
        List<String> fileNames = convertJsonToList(fileNamesJson);
        List<FileInfoDto> files = new ArrayList<>();
        for (int i = 0; i < fileUrls.size(); i++) {
            String url = fileUrls.get(i);
            String name = (i < fileNames.size()) ? fileNames.get(i) : null;
            files.add(new FileInfoDto(url, name));
        }
        return files;
    }

    private TaskDto convertToDto(Task task) {
        List<FileInfoDto> files = buildFileInfoList(task.getFileUrls(), task.getFileNames());
        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .teacherName(task.getTeacherName())
                .dueDate(task.getDueDate())
                .files(files)
                .build();
    }

    private SubmissionDto convertSubmissionToDto(Submission submission) {
        List<FileInfoDto> files = buildFileInfoList(submission.getFileUrls(), submission.getFileNames());
        return SubmissionDto.builder()
                .id(submission.getId())
                .taskId(submission.getTask().getId())
                .taskTitle(submission.getTask().getTitle())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getName())
                .files(files)
                .submittedAt(submission.getSubmittedAt())
                .feedback(submission.getFeedback())
                .status(submission.getStatus())
                .reviewedAt(submission.getReviewedAt())
                .build();
    }

    private String convertListToJson(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(list);
        } catch (Exception e) {
            return null;
        }
    }

    private List<String> convertJsonToList(String json) {
        if (json == null || json.isEmpty()) return new ArrayList<>();
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, new com.fasterxml.jackson.core.type.TypeReference<>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
