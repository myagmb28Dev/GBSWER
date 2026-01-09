package com.example.gbswer.service;

import com.example.gbswer.dto.CommunityCreateDto;
import com.example.gbswer.dto.CommunityDto;
import com.example.gbswer.dto.FileInfoDto;
import com.example.gbswer.entity.Community;
import com.example.gbswer.entity.User;
import com.example.gbswer.repository.CommunityRepository;
import com.example.gbswer.repository.UserRepository;
import com.example.gbswer.util.JsonConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;

    @Value("${file.type}")
    private String fileType;

    public Page<CommunityDto> getAllPosts(int page, int size) {
        return communityRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(this::convertToDto);
    }

    public Page<CommunityDto> getPostsByMajor(String major, int page, int size) {
        return communityRepository.findByMajorOrAllOrderByCreatedAtDesc(major, PageRequest.of(page, size))
                .map(this::convertToDto);
    }

    public Page<CommunityDto> getPostsByMajorOnly(String major, int page, int size) {
        return communityRepository.findByMajorOrderByCreatedAtDesc(major, PageRequest.of(page, size))
                .map(this::convertToDto);
    }

    @Transactional
    public CommunityDto getPostById(Long postId) {
        Community community = findCommunityById(postId);
        community.setViewCount(community.getViewCount() + 1);
        return convertToDto(community);
    }

    @Transactional
    public CommunityDto createPost(Long authorId, CommunityCreateDto request, List<MultipartFile> images) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        List<String> uploadedUrls = new ArrayList<>();
        List<String> uploadedFileNames = new ArrayList<>();
        try {
            // 학생인 경우 자신의 학과로만 설정, 교사/관리자는 요청한 major 사용 (없으면 ALL)
            String major;
            if (author.getRole() == User.Role.STUDENT) {
                // 학생은 자신의 학과로만 게시글 작성 가능
                major = author.getMajor() != null && !author.getMajor().isEmpty() 
                        ? normalizeMajor(author.getMajor()) 
                        : "ALL";
            } else {
                // 교사/관리자는 요청한 major 사용 (없으면 ALL)
                major = request.getMajor() != null && !request.getMajor().isEmpty() 
                        ? normalizeMajor(request.getMajor()) 
                        : "ALL";
            }
            
            Community community = Community.builder()
                    .title(request.getTitle())
                    .content(request.getContent())
                    .writer(request.getAnonymous() != null && request.getAnonymous() ? "익명" : author.getName())
                    .author(author)
                    .major(major)
                    .anonymous(request.getAnonymous() != null ? request.getAnonymous() : false)
                    .build();

            if (images != null && !images.isEmpty()) {
                for (MultipartFile file : images) {
                    if (file == null || file.isEmpty()) continue;
                    try {
                        String url = fileUploadService.uploadCommunityImage(authorId, file);
                        uploadedUrls.add(url);
                        uploadedFileNames.add(file.getOriginalFilename());
                    } catch (Exception fe) {
                        if (!uploadedUrls.isEmpty()) {
                            try {
                                deleteFilesByUrls(uploadedUrls);
                            } catch (Exception ignored) {
                            }
                        }
                        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "file upload failed");
                    }
                }
                community.setFileNames(JsonConverter.convertListToJson(uploadedFileNames));
                community.setFileUrls(JsonConverter.convertListToJson(uploadedUrls));
            }

            communityRepository.save(community);
            return convertToDto(community);
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            if (!uploadedUrls.isEmpty()) {
                try {
                    deleteFilesByUrls(uploadedUrls);
                } catch (Exception ignored) {
                }
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "failed to create post");
        }
    }

    @Transactional
    public CommunityDto updatePost(Long postId, Long authorId, CommunityCreateDto request, List<MultipartFile> files) {
        Community community = findCommunityById(postId);
        if (!community.getAuthor().getId().equals(authorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));


        List<String> newFileUrls = new ArrayList<>();
        List<String> newFileNames = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                try {
                    String url = fileUploadService.uploadCommunityImage(authorId, file);
                    newFileUrls.add(url);
                    newFileNames.add(file.getOriginalFilename());
                } catch (Exception e) {
                    try {
                        deleteFilesByUrls(newFileUrls);
                    } catch (Exception ignored) {
                    }
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드에 실패했습니다.");
                }
            }
        }

        try {
            List<String> oldUrls = JsonConverter.convertJsonToList(community.getFileUrls());
            deleteFilesByUrls(oldUrls);
        } catch (Exception ignored) {
        }

        if (!newFileUrls.isEmpty()) {
            community.setFileNames(JsonConverter.convertListToJson(newFileNames));
            community.setFileUrls(JsonConverter.convertListToJson(newFileUrls));
        } else {
            community.setFileNames(null);
            community.setFileUrls(null);
        }

        community.setTitle(request.getTitle());
        community.setContent(request.getContent());
        if (request.getMajor() != null) {
            if (author.getRole() == User.Role.TEACHER) {
                community.setMajor(normalizeMajor(request.getMajor()));
            } else {
                if (!normalizeMajor(request.getMajor()).equalsIgnoreCase(normalizeMajor(community.getMajor()))) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학생은 게시글의 major를 변경할 수 없습니다.");
                }
            }
        }
        communityRepository.save(community);
        return convertToDto(community);
    }

    @Transactional
    public void deletePost(Long postId, Long authorId) {
        Community community = findCommunityById(postId);
        if (!community.getAuthor().getId().equals(authorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }
        deleteFilesByUrls(JsonConverter.convertJsonToList(community.getFileNames()));
        communityRepository.delete(community);
    }

    private Community findCommunityById(Long postId) {
        return communityRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "post not found"));
    }

    private CommunityDto convertToDto(Community community) {
        List<FileInfoDto> files = JsonConverter.buildFileInfoList(community.getFileUrls(), community.getFileNames());
        return CommunityDto.builder()
                .id(community.getId())
                .title(community.getTitle())
                .content(community.getContent())
                .writer(community.getWriter())
                .createdAt(community.getCreatedAt())
                .viewCount(community.getViewCount())
                .major(community.getMajor())
                .files(files)
                .anonymous(community.getAnonymous())
                .build();
    }

    private String normalizeMajor(String major) {
        if (major == null) return "ALL";
        return major.trim();
    }

    private void deleteFilesByUrls(List<String> urls) {
        if ("local".equalsIgnoreCase(fileType) || "ec2_upload".equalsIgnoreCase(fileType)) {
            fileUploadService.deleteLocalFiles(urls);
        } else {
            fileUploadService.deleteFiles(urls);
        }
    }
}
