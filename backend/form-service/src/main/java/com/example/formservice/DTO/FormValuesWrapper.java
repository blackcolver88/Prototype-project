package com.example.formservice.DTO;

import java.util.List;

public class FormValuesWrapper {
    private List<FormValueRequest> formValues;
    private String processDefinitionKey;

    public List<FormValueRequest> getFormValues() {
        return formValues;
    }

    public void setFormValues(List<FormValueRequest> formValues) {
        this.formValues = formValues;
    }

    public String getProcessDefinitionKey() {
        return processDefinitionKey;
    }

    public void setProcessDefinitionKey(String processDefinitionKey) {
        this.processDefinitionKey = processDefinitionKey;
    }
}