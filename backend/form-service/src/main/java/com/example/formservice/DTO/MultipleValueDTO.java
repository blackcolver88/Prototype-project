package com.example.formservice.DTO;

import lombok.Data;

import java.util.List;
@Data
public class MultipleValueDTO {
    private Long id;
    private List<String> valeurs;
    private Long formInputId;
}
