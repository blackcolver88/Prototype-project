package com.example.workflowservice.controller;

import com.example.workflowservice.DTO.FormSubmissionDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.variable.VariableMap;
import org.camunda.bpm.engine.variable.Variables;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workflow")
public class WorkflowController {

    @Autowired
    private RuntimeService runtimeService;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/start-process")
    public String startProcess(@RequestBody FormSubmissionDTO formSubmission) {
        System.out.println("Received formSubmission: " + formSubmission);

        Long userId = formSubmission.getUserId();
        if (userId == null) {
            System.err.println("Warning: userId is null in formSubmission: " + formSubmission);
            throw new IllegalArgumentException("userId is required but not provided in form submission");
        }

        VariableMap variables = Variables.createVariables()
                .putValue("formSubmissionId", formSubmission.getId())
                .putValue("formId", formSubmission.getFormId())
                .putValue("submissionDate", formSubmission.getDate())
                .putValue("userId", userId)
                .putValue("task", formSubmission.getTask());

        try {
            String formValuesJson = objectMapper.writeValueAsString(formSubmission.getFormValues());
            variables.putValue("formValues", formValuesJson);
        } catch (Exception e) {
            System.err.println("Failed to serialize formValues: " + e.getMessage());
            throw new RuntimeException("Failed to serialize formValues", e);
        }

        try {
            // Use the provided process definition key or fall back to default
            String processDefinitionKey = formSubmission.getProcessDefinitionKey();
            if (processDefinitionKey == null || processDefinitionKey.trim().isEmpty()) {
                processDefinitionKey = "FormSubmissionProcess"; // Default fallback
            }

            System.out.println("Starting process with key: " + processDefinitionKey);
            runtimeService.startProcessInstanceByKey(processDefinitionKey, variables);
        } catch (Exception e) {
            System.err.println("Process start failed: " + e.getMessage());
            throw new RuntimeException("Failed to start process", e);
        }

        return "Process started for form submission ID: " + formSubmission.getId();
    }

    @GetMapping("/submission-status/{formSubmissionId}")
    public ResponseEntity<String> getSubmissionStatus(@PathVariable("formSubmissionId") Long formSubmissionId) {
        ProcessInstance processInstance = runtimeService.createProcessInstanceQuery()
                .variableValueEquals("formSubmissionId", formSubmissionId)
                .singleResult();

        if (processInstance == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No process found for form submission ID: " + formSubmissionId);
        }

        String submissionStatus = (String) runtimeService.getVariable(processInstance.getId(), "submissionStatus");
        if (submissionStatus == null) {
            return ResponseEntity.ok("PENDING");
        }

        return ResponseEntity.ok(submissionStatus);
    }
}