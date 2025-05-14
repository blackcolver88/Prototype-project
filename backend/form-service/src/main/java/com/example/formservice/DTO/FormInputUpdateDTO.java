package com.example.formservice.DTO;

import com.example.formservice.entities.enums.FormInputType;
import lombok.Data;

import java.util.List;

@Data
public class FormInputUpdateDTO {
    private String title;
    private FormInputType type;
    private boolean required;
    private Integer ordinalPosition;
    private Long formLayoutId;
    private Long formValueId;
    private List<String> multipleValues;

}
