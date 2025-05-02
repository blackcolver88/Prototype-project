package com.example.formservice.DTO;

import lombok.Data;

import java.util.List;

@Data
public class FormValueRequest {
    private Long formInputId;
    private String value;
    private List<String> multipleValues;


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