package com.example.formservice.DTO;

import com.example.formservice.entities.FormValue;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormInputWithValues {
    private String title;
    private List<FormValue> formValues;
}
