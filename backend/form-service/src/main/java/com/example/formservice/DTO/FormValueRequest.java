package com.example.formservice.DTO;

import java.util.List;

public class FormValueRequest {
    private Long formInputId;
    private String value;
    private List<String> multipleValues; 

    public Long getFormInputId() {
        return formInputId;
    }

    public void setFormInputId(Long formInputId) {
        this.formInputId = formInputId;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public List<String> getMultipleValues() {
        return multipleValues;
    }

    public void setMultipleValues(List<String> multipleValues) {
        this.multipleValues = multipleValues;
    }

    // Méthode utilitaire pour obtenir les valeurs en fonction du type de champ
    public List<String> getValues() {
        if (multipleValues != null && !multipleValues.isEmpty()) {
            return multipleValues; 
        } else if (value != null) {
            return List.of(value); 
        }
        return List.of(); 
    }
}