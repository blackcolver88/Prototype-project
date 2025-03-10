package com.example.formservice.DTO;

public class FormInputOrderDTO {
    private Long id;
    private Integer ordinalPosition;
    private Long formLayoutId;

    public FormInputOrderDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getOrdinalPosition() {
        return ordinalPosition;
    }

    public void setOrdinalPosition(Integer ordinalPosition) {
        this.ordinalPosition = ordinalPosition;
    }

    public Long getFormLayoutId() {
        return formLayoutId;
    }

    public void setFormLayoutId(Long formLayoutId) {
        this.formLayoutId = formLayoutId;
    }
} 