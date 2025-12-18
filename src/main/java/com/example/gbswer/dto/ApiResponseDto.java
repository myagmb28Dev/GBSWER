package com.example.gbswer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponseDto<T> {
    private String status;
    private String message;
    private T data;

    public static <T> ApiResponseDto<T> success(T data) {
        return ApiResponseDto.<T>builder().status("OK").data(data).build();
    }


    public static <T> ApiResponseDto<T> error(String message) {
        return ApiResponseDto.<T>builder().status("ERROR").message(message).build();
    }
}
