package com.example.gbswer.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NeisScheduleApiResponse {

    @JsonProperty("SchoolSchedule")
    private List<SchoolScheduleInfo> schoolSchedule;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SchoolScheduleInfo {

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

        @JsonProperty("SD_SCHUL_CODE")
        private String sdSchulCode;

        @JsonProperty("AY")
        private String ay;

        @JsonProperty("AA_YMD")
        private String aaYmd;

        @JsonProperty("ATPT_OFCDC_SC_NM")
        private String atptOfcdcScNm;

        @JsonProperty("SCHUL_NM")
        private String schulNm;

        @JsonProperty("DGHT_CRSE_SC_NM")
        private String dghtCrseScNm;

        @JsonProperty("SCHUL_CRSE_SC_NM")
        private String schulCrseScNm;

        @JsonProperty("EVENT_NM")
        private String eventNm;

        @JsonProperty("EVENT_CNTNT")
        private String eventCntnt;

        @JsonProperty("ONE_GRADE_EVENT_YN")
        private String oneGradeEventYn;

        @JsonProperty("TW_GRADE_EVENT_YN")
        private String twGradeEventYn;

        @JsonProperty("THREE_GRADE_EVENT_YN")
        private String threeGradeEventYn;

        @JsonProperty("FR_GRADE_EVENT_YN")
        private String frGradeEventYn;

        @JsonProperty("FIV_GRADE_EVENT_YN")
        private String fivGradeEventYn;

        @JsonProperty("SIX_GRADE_EVENT_YN")
        private String sixGradeEventYn;

        @JsonProperty("SBTR_DD_SC_NM")
        private String sbtrDdScNm;

        @JsonProperty("LOAD_DTM")
        private String loadDtm;
    }
}

