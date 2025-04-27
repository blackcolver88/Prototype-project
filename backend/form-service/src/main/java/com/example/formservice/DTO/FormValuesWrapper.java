package com.example.formservice.DTO;

import java.util.List;

public class FormValuesWrapper {
    private List<FormValueRequest> formValues;

    public List<FormValueRequest> getFormValues() {
        return formValues;
    }

    public void setFormValues(List<FormValueRequest> formValues) {
        this.formValues = formValues;
    }
}