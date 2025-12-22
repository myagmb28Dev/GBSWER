package com.example.gbswer.service;

import com.example.gbswer.dto.CommunityDto;
import com.example.gbswer.dto.FileInfoDto;
import com.example.gbswer.entity.Community;
import com.example.gbswer.entity.User;
import com.example.gbswer.repository.CommunityRepository;
import com.example.gbswer.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${file.type}")
    private String fileType;

    private String storageType() { return fileType; }

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

    private void setFilesToCommunity(Community community, List<MultipartFile> files) {
        List<String> fileUrls = new ArrayList<>();
        List<String> fileNames = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                String url = fileUploadService.uploadCommunityImage(file);
                fileUrls.add(url);
                fileNames.add(file.getOriginalFilename());
            }
        }
        community.setFileNames(convertListToJson(fileNames));
        community.setFileUrls(convertListToJson(fileUrls));
    }

    private void deleteFilesByUrls(List<String> urls) {
        boolean useLocal = "local".equalsIgnoreCase(storageType());
        if (useLocal) {
            fileUploadService.deleteLocalFiles(urls);
        } else {
            fileUploadService.deleteFiles(urls);
        }
    }

    @Transactional
    public CommunityDto createPost(Long authorId, String title, String content, String major, List<MultipartFile> images, boolean anonymous) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        try {
            Community community = Community.builder()
                    .title(title)
                    .content(content)
                    .writer(anonymous ? "익명" : author.getName())
                    .author(author)
                    .major(major != null ? major : "ALL")
                    .anonymous(anonymous)
                    .build();
            setFilesToCommunity(community, images);
            communityRepository.save(community);
            return convertToDto(community);
        } catch (Exception e) {
            log.error("Failed to save community, rolling back uploaded images", e);
            // 파일 삭제 로직은 setFilesToCommunity에서 처리된 fileUrls를 활용
            throw e;
        }
    }

    @Transactional
    public CommunityDto updatePost(Long postId, Long authorId, String title, String content,
                                    String major, List<MultipartFile> files) {
        Community community = findCommunityById(postId);
        if (!community.getAuthor().getId().equals(authorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }
        // 기존 파일 모두 삭제
        deleteFilesByUrls(convertJsonToList(community.getFileUrls()));
        // 새 파일 업로드 및 정보 갱신
        setFilesToCommunity(community, files);
        community.setTitle(title);
        community.setContent(content);
        if (major != null) community.setMajor(major);
        communityRepository.save(community);
        return convertToDto(community);
    }

    @Transactional
    public void deletePost(Long postId, Long authorId) {
        Community community = findCommunityById(postId);
        if (!community.getAuthor().getId().equals(authorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }
        deleteFilesByUrls(convertJsonToList(community.getFileNames()));
        communityRepository.delete(community);
    }

    public List<CommunityDto> getRecentNotices() {
        return communityRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5))
                .map(this::convertToDto)
                .getContent();
    }

    private Community findCommunityById(Long postId) {
        return communityRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "post not found"));
    }

    private CommunityDto convertToDto(Community community) {
        List<String> fileUrls = convertJsonToList(community.getFileUrls());
        List<String> fileNames = convertJsonToList(community.getFileNames());
        List<FileInfoDto> files = new ArrayList<>();
        for (int i = 0; i < fileUrls.size(); i++) {
            String url = fileUrls.get(i);
            String name = (i < fileNames.size()) ? fileNames.get(i) : null;
            files.add(new FileInfoDto(url, name));
        }
        return CommunityDto.builder()
                .id(community.getId())
                .title(community.getTitle())
                .content(community.getContent())
                .writer(community.getWriter())
                .createdAt(community.getCreatedAt())
                .viewCount(community.getViewCount())
                .major(community.getMajor())
                .files(files)
                .anonymous(community.isAnonymous())
                .build();
    }

    private String convertListToJson(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert list to JSON", e);
            return null;
        }
    }

    private List<String> convertJsonToList(String json) {
        if (json == null || json.isEmpty()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            log.error("Failed to convert JSON to list", e);
            return new ArrayList<>();
        }
    }
}
