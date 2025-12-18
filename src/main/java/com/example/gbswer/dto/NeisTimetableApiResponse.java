package com.example.gbswer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class NeisTimetableApiResponse {

    @JsonProperty("hisTimetable")
    private List<TimetableBlock> hisTimetable;

    @Data
    public static class TimetableBlock {
        @JsonProperty("head")
        private List<Head> head;

        @JsonProperty("row")
        private List<TimetableRow> row;
    }

    @Data
    public static class Head {
        @JsonProperty("list_total_count")
        private Integer listTotalCount;

        @JsonProperty("RESULT")
        private Result result;
    }

    @Data
    public static class Result {
        @JsonProperty("CODE")
        private String code;

        @JsonProperty("MESSAGE")
        private String message;
    }

    @Data
    public static class TimetableRow {
        @JsonProperty("ATPT_OFCDC_SC_CODE")
        private String atptOfcdcScCode;

        @JsonProperty("SD_SCHUL_CODE")
        private String sdSchulCode;

        @JsonProperty("AY")
        private String ay;

        @JsonProperty("SEM")
        private String sem;

        @JsonProperty("ALL_TI_YMD")
        private String allTiYmd;

        @JsonProperty("DDDEP_NM")
        private String dddepNm;

        @JsonProperty("GRADE")
        private String grade;

        @JsonProperty("CLASS_NM")
        private String classNm;

        @JsonProperty("PERIO")
        private String perio;

        @JsonProperty("ITRT_CNTNT")
        private String itrtCntnt;

        @JsonProperty("LOAD_DTM")
        private String loadDtm;
    }
}

