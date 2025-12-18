package com.example.gbswer.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NeisApiResponse {

    @JsonProperty("mealServiceDietInfo")
    private List<MealServiceDietInfo> mealServiceDietInfo;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MealServiceDietInfo {

        @JsonProperty("head")
        private List<Head> head;

        @JsonProperty("row")
        private List<Row> row;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Head {

        @JsonProperty("list_total_count")
        private Integer listTotalCount;

        @JsonProperty("RESULT")
        private Result result;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Result {

        @JsonProperty("CODE")
        private String code;

        @JsonProperty("MESSAGE")
        private String message;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Row {

        @JsonProperty("ATPT_OFCDC_SC_CODE")
        private String atptOfcdcScCode;

        @JsonProperty("ATPT_OFCDC_SC_NM")
        private String atptOfcdcScNm;

        @JsonProperty("SD_SCHUL_CODE")
        private String sdSchulCode;

        @JsonProperty("SCHUL_NM")
        private String schulNm;

        @JsonProperty("MMEAL_SC_CODE")
        private String mmealScCode;

        @JsonProperty("MMEAL_SC_NM")
        private String mmealScNm;

        @JsonProperty("MLSV_YMD")
        private String mlsvYmd;

        @JsonProperty("MLSV_FGR")
        private String mlsvFgr;

        @JsonProperty("DDISH_NM")
        private String ddishNm;

        @JsonProperty("ORPLC_INFO")
        private String orplcInfo;

        @JsonProperty("CAL_INFO")
        private String calInfo;

        @JsonProperty("NTR_INFO")
        private String ntrInfo;

        @JsonProperty("MLSV_FROM_YMD")
        private String mlsvFromYmd;

        @JsonProperty("MLSV_TO_YMD")
        private String mlsvToYmd;
    }
}

