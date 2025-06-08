package com.example.workflowservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "auth-service", url = "http://localhost:8080")
public interface NotificationClient {

    @PostMapping("/api/notifications/form-submission")
    ResponseEntity<String> notifyFormSubmission(
            @RequestParam("targetRole") String targetRole,
            @RequestParam("formTitle") String formTitle,
            @RequestParam("submitterName") String submitterName,
            @RequestParam("submissionDate") String submissionDate);

    @PostMapping("/api/notifications/task-completion")
    ResponseEntity<String> notifyTaskCompletion(
            @RequestParam("submitterUserId") Long submitterUserId,
            @RequestParam("formTitle") String formTitle,
            @RequestParam("reviewerName") String reviewerName,
            @RequestParam("completionDate") String completionDate,
            @RequestParam("status") String status);
}
