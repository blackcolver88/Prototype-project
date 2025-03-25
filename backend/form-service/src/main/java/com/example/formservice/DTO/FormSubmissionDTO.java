package com.example.formservice.DTO;

import com.example.formservice.DTO.FormValueDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Data
@NoArgsConstructor
public class FormSubmissionDTO {
    private Long id;
    private LocalDateTime date;
    private String task;
    private String formTitle;
    private List<FormValueDTO> formValues;

    public FormSubmissionDTO(Long id, LocalDateTime date, String task, String formTitle, List<String> formValues) {
        this.id = id;
        this.date = date;
        this.task = task;
        this.formTitle = formTitle;
        this.formValues = formValues.stream()
                .map(value -> new FormValueDTO(null, value)) // Mapper les valeurs simples en FormValueDTO
                .collect(Collectors.toList());
    }

    public static FormSubmissionDTO fromFormValueDTOs(
            Long id, LocalDateTime date, String task, String formTitle, List<FormValueDTO> formValues) {
        FormSubmissionDTO dto = new FormSubmissionDTO();
        dto.setId(id);
        dto.setDate(date);
        dto.setTask(task);
        dto.setFormTitle(formTitle);
        dto.setFormValues(formValues);
        return dto;
    }
}