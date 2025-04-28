package com.example.formservice.DTO;

import com.example.formservice.entities.FormLayout;
import com.example.formservice.entities.enums.FormLayoutType;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class FormLayoutDTO {
    private Long id;
    private String title;
    private FormLayoutType type;
    private Integer ordinalPosition;
    private Long parentId;
    private List<FormLayoutDTO> children;
    private List<FormInputDTO> formInputs;

    public FormLayoutDTO(FormLayout layout) {
        this.id = layout.getId();
        this.title = layout.getTitle();
        this.type = layout.getType();
        this.ordinalPosition = layout.getOrdinalPosition();

        if (layout.getParent() != null) {
            this.parentId = layout.getParent().getId();
        }

        if (layout.getChildren() != null) {
            this.children = layout.getChildren().stream()
                    .map(FormLayoutDTO::new)
                    .collect(Collectors.toList());
        } else {
            this.children = new ArrayList<>();
        }

        if (layout.getFormInputs() != null) {
            this.formInputs = layout.getFormInputs().stream()
                    .map(FormInputDTO::new)
                    .collect(Collectors.toList());
        } else {
            this.formInputs = new ArrayList<>();
        }
    }
}
