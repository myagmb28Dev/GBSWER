package com.example.gbswer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileUploadService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private String serverPort() { return System.getProperty("server.port", "8080"); }

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
        return uploadToLocal(file, "posts");
    }

    public String uploadTaskFile(MultipartFile file) {
        validateTaskFile(file);
        return uploadToLocal(file, "tasks");
    }

    public String uploadSubmissionFile(MultipartFile file) {
        validateTaskFile(file);
        return uploadToLocal(file, "submissions");
    }

    public void deleteFile(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) return;
        deleteLocalFile(imageUrl);
    }

    public void deleteFiles(List<String> imageUrls) {
        if (imageUrls == null) return;
        imageUrls.forEach(this::deleteFile);
    }
    public void deleteLocalFile(String fileName) {
        if (fileName == null || fileName.isEmpty()) return;
        try {
            String relativePath = extractLocalPath(fileName);
            Path path = Paths.get(uploadDir, relativePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
        }
    }

    public void deleteLocalFiles(List<String> fileNames) {
        if (fileNames == null) return;
        fileNames.forEach(this::deleteLocalFile);
    }


    private String uploadToLocal(MultipartFile file, String folder) {
        String extension = getExtension(file.getOriginalFilename());
        String generatedFilename = UUID.randomUUID() + "." + extension;
        LocalDate now = LocalDate.now();

        String relativePath = String.format("%s/%s/%s/%s", folder,
                now.format(DateTimeFormatter.ofPattern("yyyy")),
                now.format(DateTimeFormatter.ofPattern("MM")),
                generatedFilename);

        Path fullPath = Paths.get(uploadDir, relativePath);
        try {
            Files.createDirectories(fullPath.getParent());
            file.transferTo(fullPath.toFile());

            String port = serverPort();
            return String.format("http://localhost:%s/uploads/%s", port, relativePath);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드에 실패했습니다.");
        }
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


    private String extractLocalPath(String fileName) {
        if (fileName == null || fileName.isEmpty()) return null;
        try {
            int idx = fileName.indexOf("/uploads/");
            if (idx != -1) {
                return fileName.substring(idx + 9);
            }
            return fileName.replaceFirst("^/+", "");
        } catch (Exception e) {
            return fileName;
        }
    }

    @PostConstruct
    public void initUploadDir() {
        try {
            if (uploadDir == null || uploadDir.isEmpty()) {
                return;
            }
            Path base = Paths.get(uploadDir);
            if (!Files.exists(base)) {
                Files.createDirectories(base);
            }
        } catch (Exception e) {}
    }
}
