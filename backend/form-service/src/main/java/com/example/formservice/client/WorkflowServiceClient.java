package com.example.formservice.client;

import com.example.formservice.DTO.FormSubmissionDTO;
import com.example.formservice.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "workflow-service", configuration = FeignConfig.class)public interface WorkflowServiceClient {

    @PostMapping("/api/workflow/start-process")
    String startProcess(@RequestBody FormSubmissionDTO formSubmission);
}
