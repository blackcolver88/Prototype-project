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
    @Getter
    @Setter
    private String task;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public Long getFormId() { return formId; }
    public void setFormId(Long formId) { this.formId = formId; }

    public List<FormValueDTO> getFormValues() { return formValues; }
    public void setFormValues(List<FormValueDTO> formValues) { this.formValues = formValues; }

    public String getProcessInstanceId() { return processInstanceId; }
    public void setProcessInstanceId(String processInstanceId) { this.processInstanceId = processInstanceId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTask() { return task; }
    public void setTask(String task) { this.task = task; }

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

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }

}