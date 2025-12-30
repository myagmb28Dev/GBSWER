package com.example.gbswer.service;

import com.example.gbswer.dto.*;
import com.example.gbswer.entity.Class;
import com.example.gbswer.entity.ClassParticipant;
import com.example.gbswer.entity.User;
import com.example.gbswer.repository.ClassParticipantRepository;
import com.example.gbswer.repository.ClassRepository;
import com.example.gbswer.repository.TaskRepository;
import com.example.gbswer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final ClassParticipantRepository classParticipantRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional
    public ClassDto createClass(UserDto teacher, ClassCreateDto request) {
        User teacherEntity = userRepository.findById(teacher.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "teacher not found"));

        if (teacherEntity.getRole() != User.Role.TEACHER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "only teachers can create classes");
        }

        if (classRepository.existsByClassCode(request.getClassCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "class code already exists");
        }

        Class classEntity = Class.builder()
                .className(request.getClassName())
                .classCode(request.getClassCode())
                .teacher(teacherEntity)
                .createdAt(LocalDateTime.now())
                .build();

        classRepository.save(classEntity);
        return convertToDto(classEntity);
    }

    @Transactional
    public ClassJoinDto joinClass(UserDto student, ClassJoinDto request) {
        User studentEntity = userRepository.findById(student.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "student not found"));

        Class classEntity = classRepository.findByClassCode(request.getClassCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "class not found"));

        if (classParticipantRepository.existsByClassEntityAndStudent(classEntity, studentEntity)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "already joined this class");
        }

        ClassParticipant participant = ClassParticipant.builder()
                .classEntity(classEntity)
                .student(studentEntity)
                .joinedAt(LocalDateTime.now())
                .build();

        classParticipantRepository.save(participant);

        return ClassJoinDto.builder()
                .classCode(classEntity.getClassCode())
                .build();
    }

    public List<ClassDto> getClassesForTeacher(UserDto teacher) {
        User teacherEntity = userRepository.findById(teacher.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "teacher not found"));

        List<Class> classes = classRepository.findAll().stream()
                .filter(c -> c.getTeacher().getId().equals(teacher.getId()))
                .collect(Collectors.toList());

        return classes.stream()
                .map(this::convertToDtoWithDetails)
                .collect(Collectors.toList());
    }

    public List<ClassDto> getClassesForStudent(UserDto student) {
        User studentEntity = userRepository.findById(student.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "student not found"));

        List<ClassParticipant> participants = classParticipantRepository.findByStudent(studentEntity);
        return participants.stream()
                .map(p -> convertToDtoWithDetails(p.getClassEntity()))
                .collect(Collectors.toList());
    }

    public ClassDto getClassById(Long classId, UserDto user) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "class not found"));

        // 권한 체크: 선생님이거나 참가자여야 함
        User userEntity = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));

        boolean isTeacher = classEntity.getTeacher().getId().equals(user.getId());
        boolean isParticipant = classParticipantRepository.existsByClassEntityAndStudent(classEntity, userEntity);

        if (!isTeacher && !isParticipant) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }

        return convertToDtoWithDetails(classEntity);
    }

    @Transactional
    public void deleteClass(Long classId, UserDto teacher) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "class not found"));

        if (!classEntity.getTeacher().getId().equals(teacher.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }

        // 관련 데이터 삭제
        List<ClassParticipant> participants = classParticipantRepository.findByClassEntity(classEntity);
        classParticipantRepository.deleteAll(participants);

        // 관련 posts 삭제 (Task에서 classId가 있는 것들)
        taskRepository.findAll().stream()
                .filter(t -> t.getClassEntity() != null && t.getClassEntity().getId().equals(classId))
                .forEach(taskRepository::delete);

        classRepository.delete(classEntity);
    }

    public List<ClassParticipantDto> getParticipants(Long classId, UserDto user) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "class not found"));

        if (!classEntity.getTeacher().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }

        List<ClassParticipant> participants = classParticipantRepository.findByClassEntity(classEntity);
        return participants.stream()
                .map(this::convertParticipantToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeParticipant(Long classId, Long studentId, UserDto teacher) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "class not found"));

        if (!classEntity.getTeacher().getId().equals(teacher.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "student not found"));

        ClassParticipant participant = classParticipantRepository.findByClassEntityAndStudent(classEntity, student)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "participant not found"));

        classParticipantRepository.delete(participant);
    }

    private ClassDto convertToDto(Class classEntity) {
        return ClassDto.builder()
                .id(classEntity.getId())
                .className(classEntity.getClassName())
                .classCode(classEntity.getClassCode())
                .teacherId(classEntity.getTeacher().getId())
                .createdAt(classEntity.getCreatedAt())
                .build();
    }

    private ClassDto convertToDtoWithDetails(Class classEntity) {
        List<ClassParticipantDto> participants = classParticipantRepository.findByClassEntity(classEntity)
                .stream()
                .map(this::convertParticipantToDto)
                .collect(Collectors.toList());

        List<TaskDto> posts = taskRepository.findAll().stream()
                .filter(t -> t.getClassEntity() != null && t.getClassEntity().getId().equals(classEntity.getId()))
                .map(t -> TaskDto.builder()
                        .id(t.getId())
                        .title(t.getTitle())
                        .type(t.getType())
                        .dueDate(t.getDueDate())
                        .build())
                .collect(Collectors.toList());

        return ClassDto.builder()
                .id(classEntity.getId())
                .className(classEntity.getClassName())
                .classCode(classEntity.getClassCode())
                .teacherId(classEntity.getTeacher().getId())
                .teacherName(classEntity.getTeacher().getName())
                .createdAt(classEntity.getCreatedAt())
                .participantCount(participants.size())
                .participants(participants)
                .posts(posts)
                .build();
    }

    private ClassParticipantDto convertParticipantToDto(ClassParticipant participant) {
        return ClassParticipantDto.builder()
                .id(participant.getId())
                .classId(participant.getClassEntity().getId())
                .studentId(participant.getStudent().getId())
                .studentName(participant.getStudent().getName())
                .studentNumber(participant.getStudent().getStudentNumber())
                .profileImage(participant.getStudent().getProfileImage())
                .joinedAt(participant.getJoinedAt())
                .build();
    }

    public List<ClassDto> getAllClassesForAdmin() {
        List<Class> classes = classRepository.findAll();
        return classes.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<Long> getParticipantIds(Long classId) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "class not found"));
        return classParticipantRepository.findByClassEntity(classEntity)
                .stream()
                .map(cp -> cp.getStudent().getId())
                .collect(Collectors.toList());
    }
}
