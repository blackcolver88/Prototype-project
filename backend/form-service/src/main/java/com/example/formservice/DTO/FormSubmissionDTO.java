package com.example.formservice.DTO;

import com.example.formservice.entities.FormSubmission;
import com.example.formservice.entities.FormValue;
import com.example.formservice.service.FormInputService;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    @Setter
    private Long userId;
    @Setter
    private Long formId;
    @Setter
    private String processDefinitionKey;
    @Setter
    private String targetRole;

    
    public FormSubmissionDTO(Long id, LocalDateTime date, String task, String formTitle, List<String> formValues) {
        this.id = id;
        this.date = date;
        this.task = task;
        this.formTitle = formTitle;
        this.formValues = formValues.stream()
                .map(value -> new FormValueDTO(null, value))
                .collect(Collectors.toList());
    }

    
    public static FormSubmissionDTO formFormSubmission(FormSubmission submission, String formTitle,
            FormInputService formInputService) {
        FormSubmissionDTO dto = new FormSubmissionDTO(
                submission.getId(),
                submission.getDate(),
                submission.getUserTask(),
                formTitle,
                submission.getFormValues().stream()
                        .map(FormValue::getValue)
                        .collect(Collectors.toList()));

        dto.setFormValues(submission.getFormValues().stream()
                .map(fv -> {
                    String title = fv.getFormInputs() != null && !fv.getFormInputs().isEmpty()
                            ? formInputService.getFormInputTitleById(fv.getFormInputs().get(0).getId())
                            : "Untitled";
                    return new FormValueDTO(title, fv.getValue());
                })
                .collect(Collectors.toList()));

        return dto;
    }
}