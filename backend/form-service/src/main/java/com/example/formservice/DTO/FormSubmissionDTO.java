package com.example.formservice.DTO;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class FormSubmissionDTO {
    private Long id;
    private LocalDateTime date;
    private String task; 
    private String formTitle; 
    private List<String> formValues; 

    public FormSubmissionDTO(Long id, LocalDateTime date, String task, String formTitle, List<String> formValues) {
        this.id = id;
        this.date = date;
        this.task = task;
        this.formTitle = formTitle;
        this.formValues = formValues;
    }
}