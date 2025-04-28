package com.example.formservice.DTO;

import com.example.formservice.entities.FormTemplate;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class FormTemplateDTO {
    private Long id;
    private String title;
    private List<FormLayoutDTO> formLayouts;

    public FormTemplateDTO(FormTemplate template) {
        this.id = template.getId();
        this.title = template.getTitle();
        if (template.getFormLayouts() != null) {
            this.formLayouts = template.getFormLayouts().stream()
                    .map(FormLayoutDTO::new)
                    .collect(Collectors.toList());
        } else {
            this.formLayouts = new ArrayList<>();
        }
    }
}