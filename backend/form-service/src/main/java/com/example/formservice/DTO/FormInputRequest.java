package com.example.formservice.DTO;

import com.example.formservice.entities.FormInput;

public class FormInputRequest {
    private FormInput formInput;
    private Long formLayoutId;

    public FormInput getFormInput() {
        return formInput;
    }

    public void setFormInput(FormInput formInput) {
        this.formInput = formInput;
    }

    public Long getFormLayoutId() {
        return formLayoutId;
    }

    public void setFormLayoutId(Long formLayoutId) {
        this.formLayoutId = formLayoutId;
    }
}