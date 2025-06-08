package com.example.workflowservice.delegates;

import com.example.workflowservice.DTO.FormSubmissionDTO;
import com.example.workflowservice.service.NotificationService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component("processFormSubmission")
public class ProcessFormSubmissionDelegate implements JavaDelegate {

    @Autowired
    private DiscoveryClient discoveryClient;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationService notificationService;

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

        log.info("Delegate executing with formSubmissionId: {}", formSubmissionId);
        log.info("Available services: {}", discoveryClient.getServices());
        log.info("Form-service instances: {}", discoveryClient.getInstances("FORM-SERVICE"));

        List<FormSubmissionDTO.FormValueDTO> formValues = objectMapper.readValue(formValuesJson,
                new TypeReference<List<FormSubmissionDTO.FormValueDTO>>() {});

        FormSubmissionDTO formSubmission = new FormSubmissionDTO(formSubmissionId, submissionDate, formId, formValues);
        formSubmission.setProcessInstanceId(execution.getProcessInstanceId());

        // Skip the call to form-service since the PATCH endpoint may not exist
        try {
            // Perform any internal workflow logic here if needed
            execution.setVariable("submissionStatus", "SUCCESS");
            
            // Send notification to users with target role about the new form submission
            String targetRole = (String) execution.getVariable("targetRole");
            String task = (String) execution.getVariable("task");
            
            if (targetRole != null && !targetRole.trim().isEmpty()) {
                String formTitle = task != null ? task : "Form Submission";
                String submitterName = "User ID: " + userId; // TODO: Get actual user name
                String submissionDateStr = submissionDate != null ? 
                    submissionDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : 
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                
                log.info("Sending notification for form submission to role: {}", targetRole);
                notificationService.notifyFormSubmission(targetRole, formTitle, submitterName, submissionDateStr);
            }
        } catch (Exception e) {
            log.error("Failed to process submission: {}", e.getMessage(), e);
            execution.setVariable("submissionStatus", "FAILED");
            throw new RuntimeException("Failed to process submission", e);
        }
    }
}