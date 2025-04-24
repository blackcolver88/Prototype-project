package com.example.formservice.DTO;

import com.example.formservice.entities.enums.FormLayoutType;
import lombok.Data;

import java.util.List;

@Data
public class FormLayoutDTO {
    private Long id;
    private String title;
    private FormLayoutType type;
    private Integer ordinalPosition;
    private Long parentId; 
    private List<FormLayoutDTO> children;
}