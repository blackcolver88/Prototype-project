package com.example.formservice.DTO;

import com.example.formservice.DTO.FormValueDTO;
import com.example.formservice.entities.FormSubmission;
import com.example.formservice.service.FormInputService;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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

    public static FormSubmissionDTO fromFormSubmission(
            FormSubmission submission,
            String formTitle,
            FormInputService formInputService) {
        FormSubmissionDTO dto = new FormSubmissionDTO();
        dto.setId(submission.getId());
        dto.setDate(submission.getDate());
        dto.setTask(submission.getUser().getTask());
        dto.setFormTitle(formTitle);

        // Map FormValues to FormValueDTO with titles retrieved via service
        dto.setFormValues(submission.getFormValues().stream()
                .map(formValue -> {
                    // Retrieve the title of the first FormInput associated with this FormValue
                    String title = "N/A";
                    if (!formValue.getFormInputs().isEmpty()) {
                        // Get the first FormInput's ID
                        Long formInputId = formValue.getFormInputs().get(0).getId();

                        // Use FormInputService to retrieve the title
                        title = formInputService.getFormInputTitleById(formInputId);
                    }

                    return new FormValueDTO(title, formValue.getValue());
                })
                .collect(Collectors.toList()));

        return dto;
    }
}