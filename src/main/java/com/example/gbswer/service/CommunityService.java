package com.example.gbswer.service;

import com.example.gbswer.dto.CommunityDto;
import com.example.gbswer.entity.Community;
import com.example.gbswer.entity.User;
import com.example.gbswer.repository.CommunityRepository;
import com.example.gbswer.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<CommunityDto> getAllPosts() {
        return communityRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<CommunityDto> getPostsByDepartment(String department) {
        return communityRepository.findByDepartmentOrAllOrderByCreatedAtDesc(department).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<CommunityDto> getPostsByDepartmentOnly(String department) {
        return communityRepository.findByDepartmentOrderByCreatedAtDesc(department).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommunityDto getPostById(Long postId) {
        Community community = findCommunityById(postId);
        community.setViewCount(community.getViewCount() + 1);
        return convertToDto(community);
    }

    @Transactional
    public CommunityDto createPost(Long authorId, String title, String content, String department, List<MultipartFile> images) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));

        List<String> imageUrls = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            imageUrls = uploadImagesWithRollback(images);
        }

        try {
            Community community = Community.builder()
                    .title(title)
                    .content(content)
                    .writer(author.getName())
                    .author(author)
                    .department(department != null ? department : "ALL")
                    .imageUrls(convertListToJson(imageUrls))
                    .build();

            communityRepository.save(community);
            return convertToDto(community);
        } catch (Exception e) {
            log.error("Failed to save community, rolling back uploaded images", e);
            fileUploadService.deleteFiles(imageUrls);
            throw e;
        }
    }

    @Transactional
    public CommunityDto updatePost(Long postId, Long authorId, String title, String content,
                                    String department, List<MultipartFile> newImages, List<String> existingImageUrls) {
        Community community = findCommunityById(postId);

        if (!community.getAuthor().getId().equals(authorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }

        List<String> oldImageUrls = convertJsonToList(community.getImageUrls());
        List<String> keepImageUrls = existingImageUrls != null ? new ArrayList<>(existingImageUrls) : new ArrayList<>();

        List<String> newUploadedUrls = new ArrayList<>();
        if (newImages != null && !newImages.isEmpty()) {
            newUploadedUrls = uploadImagesWithRollback(newImages);
        }

        try {
            for (String oldUrl : oldImageUrls) {
                if (!keepImageUrls.contains(oldUrl)) {
                    fileUploadService.deleteFile(oldUrl);
                }
            }

            List<String> finalImageUrls = new ArrayList<>(keepImageUrls);
            finalImageUrls.addAll(newUploadedUrls);

            community.setTitle(title);
            community.setContent(content);
            if (department != null) community.setDepartment(department);
            community.setImageUrls(convertListToJson(finalImageUrls));

            communityRepository.save(community);
            return convertToDto(community);
        } catch (Exception e) {
            log.error("Failed to update community, rolling back newly uploaded images", e);
            fileUploadService.deleteFiles(newUploadedUrls);
            throw e;
        }
    }

    @Transactional
    public void deletePost(Long postId, Long authorId) {
        Community community = findCommunityById(postId);

        if (!community.getAuthor().getId().equals(authorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not authorized");
        }

        fileUploadService.deleteFiles(convertJsonToList(community.getImageUrls()));
        communityRepository.delete(community);
    }

    public List<CommunityDto> getRecentNotices() {
        return communityRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    private Community findCommunityById(Long postId) {
        return communityRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "post not found"));
    }

    private List<String> uploadImagesWithRollback(List<MultipartFile> images) {
        List<String> uploadedUrls = new ArrayList<>();
        try {
            for (MultipartFile file : images) {
                if (file == null || file.isEmpty()) continue;
                uploadedUrls.add(fileUploadService.uploadCommunityImage(file));
            }
            return uploadedUrls;
        } catch (Exception e) {
            log.error("Image upload failed, rolling back {} uploaded images", uploadedUrls.size());
            fileUploadService.deleteFiles(uploadedUrls);
            throw e;
        }
    }

    private CommunityDto convertToDto(Community community) {
        return CommunityDto.builder()
                .id(community.getId())
                .title(community.getTitle())
                .content(community.getContent())
                .writer(community.getWriter())
                .createdAt(community.getCreatedAt())
                .viewCount(community.getViewCount())
                .department(community.getDepartment())
                .imageUrls(convertJsonToList(community.getImageUrls()))
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
