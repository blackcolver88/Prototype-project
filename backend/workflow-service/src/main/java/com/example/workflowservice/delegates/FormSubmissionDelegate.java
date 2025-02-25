package com.example.workflowservice.delegates;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component("formSubmissionDelegate") // 👈 Make sure this matches the expression name
public class FormSubmissionDelegate implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) {
        System.out.println("Executing form submission logic...");
    }
}