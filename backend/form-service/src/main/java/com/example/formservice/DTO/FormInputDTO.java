package com.example.formservice.DTO;

import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.enums.FormInputType;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FormInputDTO {
    private Long id;
    private String title;
    private FormInputType type;
    private boolean required;
    private Integer ordinalPosition;

    public FormInputDTO(FormInput input) {
        this.id = input.getId();
        this.title = input.getTitle();
        this.type = input.getType();
        this.required = input.isRequired();
        this.ordinalPosition = input.getOrdinalPosition();
    }
}