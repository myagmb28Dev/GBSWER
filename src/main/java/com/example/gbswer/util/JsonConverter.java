package com.example.gbswer.util;

import com.example.gbswer.dto.FileInfoDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class JsonConverter {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String convertListToJson(List<String> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            log.warn("리스트를 JSON으로 변환 실패: {}", e.getMessage());
            return null;
        }
    }

    public static List<String> convertJsonToList(String json) {
        if (json == null || json.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("JSON을 리스트로 변환 실패: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public static List<FileInfoDto> buildFileInfoList(String fileUrlsJson, String fileNamesJson) {
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
}

