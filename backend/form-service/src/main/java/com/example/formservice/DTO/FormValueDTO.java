package com.example.formservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FormValueDTO {
    private String title;
    private String value;

    public FormValueDTO(String title, String value) {
        this.title = title;
        this.value = value;
    }
}
