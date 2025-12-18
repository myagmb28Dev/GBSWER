package com.example.gbswer.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.region}")
    private String region;

    private static final Set<String> ALLOWED_IMAGE_MIME_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private static final Set<String> ALLOWED_TASK_MIME_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            "application/zip",
            "application/x-zip-compressed"
    );

    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    private static final long MAX_TASK_FILE_SIZE = 50 * 1024 * 1024;

    public String uploadCommunityImage(MultipartFile file) {
        validateImageFile(file);
        return uploadToS3(file, "posts");
    }

    public String uploadTaskFile(MultipartFile file) {
        validateTaskFile(file);
        return uploadToS3(file, "tasks");
    }

    public String uploadSubmissionFile(MultipartFile file) {
        validateTaskFile(file);
        return uploadToS3(file, "submissions");
    }

    public void deleteFile(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) return;

        try {
            String s3Key = extractS3Key(imageUrl);
            if (s3Key == null) return;

            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3Key)
                    .build());
            log.info("S3 delete success: {}", s3Key);
        } catch (Exception e) {
            log.error("S3 delete failed: {}", imageUrl, e);
        }
    }

    public void deleteFiles(List<String> imageUrls) {
        if (imageUrls == null) return;
        imageUrls.forEach(this::deleteFile);
    }

    private String uploadToS3(MultipartFile file, String folder) {
        String extension = getExtension(file.getOriginalFilename());
        String generatedFilename = UUID.randomUUID() + "." + extension;
        LocalDate now = LocalDate.now();
        String s3Key = String.format("%s/%s/%s/%s", folder,
                now.format(DateTimeFormatter.ofPattern("yyyy")),
                now.format(DateTimeFormatter.ofPattern("MM")),
                generatedFilename);

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(s3Key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(file.getBytes()));
            log.info("S3 upload success: {}", s3Key);
        } catch (IOException e) {
            log.error("S3 upload failed: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드에 실패했습니다.");
        }

        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, s3Key);
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일이 존재하지 않습니다.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_MIME_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "허용되지 않는 이미지 형식입니다. (허용: jpeg, png, gif, webp)");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일 크기는 10MB를 초과할 수 없습니다.");
        }
    }

    private void validateTaskFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일이 존재하지 않습니다.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TASK_MIME_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "허용되지 않는 파일 형식입니다. (허용: 이미지, PDF, Office 문서, 압축파일)");
        }
        if (file.getSize() > MAX_TASK_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일 크기는 50MB를 초과할 수 없습니다.");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "png";
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private String extractS3Key(String imageUrl) {
        try {
            String prefix = String.format("https://%s.s3.%s.amazonaws.com/", bucket, region);
            if (imageUrl.startsWith(prefix)) {
                return imageUrl.substring(prefix.length());
            }
            return null;
        } catch (Exception e) {
            log.error("Failed to extract S3 key from URL: {}", imageUrl);
            return null;
        }
    }
}
