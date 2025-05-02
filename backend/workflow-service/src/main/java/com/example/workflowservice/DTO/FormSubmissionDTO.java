package com.example.workflowservice.DTO;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class FormSubmissionDTO {
    private Long id;
    private LocalDateTime date;
    private Long formId;
    private List<FormValueDTO> formValues = new ArrayList<>();
    private String processInstanceId;
    private Long userId;
    private String task;

    @Override
    public String toString() {
        return "FormSubmissionDTO{id=" + id + ", date=" + date + ", formId=" + formId +
                ", userId=" + userId + ", task='" + task + "', formValues=" + formValues + "}";
    }

    public FormSubmissionDTO(Long id, LocalDateTime date, Long formId, List<FormValueDTO> formValues) {
        this.id = id;
        this.date = date;
        this.formId = formId;
        this.formValues = formValues != null ? formValues : new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    public static class FormValueDTO {
        private String title;
        private String value;
        public FormValueDTO(String title, String value) {
            this.title = title;
            this.value = value;
        }

    }

}