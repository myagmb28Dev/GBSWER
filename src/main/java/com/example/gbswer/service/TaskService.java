package com.example.gbswer.service;

import com.example.gbswer.dto.SubmissionDto;
import com.example.gbswer.dto.TaskDto;
import com.example.gbswer.dto.FileInfoDto;
import com.example.gbswer.entity.Submission;
import com.example.gbswer.entity.Task;
import com.example.gbswer.entity.User;
import com.example.gbswer.repository.SubmissionRepository;
import com.example.gbswer.repository.TaskRepository;
import com.example.gbswer.repository.UserRepository;
import com.example.gbswer.repository.ClassRepository;
import com.example.gbswer.util.JsonConverter;
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
    private final ClassRepository classRepository;
    private final FileUploadService fileUploadService;

    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unused")
    public TaskDto getTaskById(Long taskId) {
        return convertToDto(findTaskById(taskId));
    }

    @Transactional
    public TaskDto createTask(Long teacherId, String title, String content, String type, Long classId, LocalDate dueDate, List<MultipartFile> files) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "teacher not found"));

        List<String> fileUrls = new ArrayList<>();
        List<String> fileNames = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                String url = fileUploadService.uploadTaskFile(teacherId, file);
                fileUrls.add(url);
                fileNames.add(file.getOriginalFilename());
            }
        }

        Task task = Task.builder()
                .title(title)
                .content(content)
                .dueDate(dueDate)
                .type(type)
                .classEntity(classId != null ? classRepository.findById(classId).orElse(null) : null)
                .teacher(teacher)
                .teacherName(teacher.getName())
                .fileNames(JsonConverter.convertListToJson(fileNames))
                .fileUrls(JsonConverter.convertListToJson(fileUrls))
                .build();

        taskRepository.save(task);
        return convertToDto(task);
    }

    @Transactional
    public TaskDto updateTask(Long taskId, Long teacherId, String title, String content, String type, Long classId, LocalDate dueDate, List<MultipartFile> files) {
        Task task = findTaskById(taskId);

        if (!task.getTeacher().getId().equals(teacherId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }

        if (files != null && !files.isEmpty()) {
            if (task.getFileUrls() != null) {
                fileUploadService.deleteFiles(JsonConverter.convertJsonToList(task.getFileUrls()));
            }

            List<String> fileUrls = new ArrayList<>();
            List<String> fileNames = new ArrayList<>();
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                String url = fileUploadService.uploadTaskFile(teacherId, file);
                fileUrls.add(url);
                fileNames.add(file.getOriginalFilename());
            }
            task.setFileNames(JsonConverter.convertListToJson(fileNames));
            task.setFileUrls(JsonConverter.convertListToJson(fileUrls));
        }

        task.setTitle(title);
        task.setContent(content);
        task.setDueDate(dueDate);
        task.setType(type);
        if (classId != null) {
            task.setClassEntity(classRepository.findById(classId).orElse(null));
        }
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
            String url = fileUploadService.uploadSubmissionFile(studentId, file);
            fileUrls.add(url);
            fileNames.add(file.getOriginalFilename());
        }

        Submission submission = submissionRepository.findByTaskAndStudent(task, student)
                .orElse(Submission.builder().task(task).student(student).build());

        if (submission.getFileNames() != null) {
            fileUploadService.deleteFiles(JsonConverter.convertJsonToList(submission.getFileNames()));
        }

        submission.setFileNames(JsonConverter.convertListToJson(fileNames));
        submission.setFileUrls(JsonConverter.convertListToJson(fileUrls));
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

    @SuppressWarnings("unused")
    public SubmissionDto getSubmissionById(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "submission not found"));
        return convertSubmissionToDto(submission);
    }

    @SuppressWarnings("unused")
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
            fileUploadService.deleteFiles(JsonConverter.convertJsonToList(task.getFileNames()));
        }

        List<Submission> submissions = submissionRepository.findByTask(task);
        for (Submission submission : submissions) {
            if (submission.getFileNames() != null) {
                fileUploadService.deleteFiles(JsonConverter.convertJsonToList(submission.getFileNames()));
            }
        }

        taskRepository.delete(task);
    }

    private Task findTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "task not found"));
    }

    private TaskDto convertToDto(Task task) {
        List<FileInfoDto> files = JsonConverter.buildFileInfoList(task.getFileUrls(), task.getFileNames());
        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .content(task.getContent())
                .teacherName(task.getTeacherName())
                .dueDate(task.getDueDate())
                .type(task.getType())
                .classId(task.getClassEntity() != null ? task.getClassEntity().getId() : null)
                .files(files)
                .createdAt(task.getCreatedAt())
                .build();
    }

    private SubmissionDto convertSubmissionToDto(Submission submission) {
        List<FileInfoDto> files = JsonConverter.buildFileInfoList(submission.getFileUrls(), submission.getFileNames());
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

}
