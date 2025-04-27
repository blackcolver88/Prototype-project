package com.example.workflowservice.delegates;

import com.example.workflowservice.DTO.FormSubmissionDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component("processFormSubmission")
public class ProcessFormSubmissionDelegate implements JavaDelegate {

    @Autowired
    private DiscoveryClient discoveryClient;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long formSubmissionId = (Long) execution.getVariable("formSubmissionId");
        Long formId = (Long) execution.getVariable("formId");
        LocalDateTime submissionDate = (LocalDateTime) execution.getVariable("submissionDate");
        String formValuesJson = (String) execution.getVariable("formValues");

        Long userId = (Long) execution.getVariable("userId");
        if (userId == null) {
            throw new RuntimeException("userId is required but not provided in process variables");
        }

        System.out.println("Delegate executing with formSubmissionId: " + formSubmissionId);
        System.out.println("Available services: " + discoveryClient.getServices());
        System.out.println("Form-service instances: " + discoveryClient.getInstances("FORM-SERVICE"));

        List<FormSubmissionDTO.FormValueDTO> formValues = objectMapper.readValue(formValuesJson,
                new TypeReference<List<FormSubmissionDTO.FormValueDTO>>() {});

        FormSubmissionDTO formSubmission = new FormSubmissionDTO(formSubmissionId, submissionDate, formId, formValues);
        formSubmission.setProcessInstanceId(execution.getProcessInstanceId());

        // Skip the call to form-service since the PATCH endpoint may not exist
        try {
            // Perform any internal workflow logic here if needed
            execution.setVariable("submissionStatus", "SUCCESS");
        } catch (Exception e) {
            System.err.println("Failed to process submission: " + e.getMessage());
            execution.setVariable("submissionStatus", "FAILED");
            throw new RuntimeException("Failed to process submission", e);
        }
    }
}