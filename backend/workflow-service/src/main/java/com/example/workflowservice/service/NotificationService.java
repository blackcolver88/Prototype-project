package com.example.workflowservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@Slf4j
public class NotificationService {

    private final RestTemplate restTemplate;
    
    @Value("${notification.api-gateway.url:http://localhost:8222}")
    private String apiGatewayUrl;
    
    @Value("${notification.auth-service.path:/auth-service}")
    private String authServicePath;

    public NotificationService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Sends notification to users with specified role about form submission
     */
    public void notifyFormSubmission(String targetRole, String formTitle, 
                                   String submitterName, String submissionDate) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(apiGatewayUrl + authServicePath + "/api/notifications/form-submission")
                    .queryParam("targetRole", targetRole)
                    .queryParam("formTitle", formTitle)
                    .queryParam("submitterName", submitterName)
                    .queryParam("submissionDate", submissionDate)
                    .toUriString();

            String response = restTemplate.postForObject(url, null, String.class);
            log.info("Form submission notification sent successfully: {}", response);
        } catch (Exception e) {
            log.error("Failed to send form submission notification: {}", e.getMessage());
            // Don't throw exception to avoid disrupting the workflow
        }
    }

    /**
     * Sends notification to form submitter about task completion
     */
    public void notifyTaskCompletion(Long submitterUserId, String formTitle, 
                                   String reviewerName, String completionDate, String status) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(apiGatewayUrl + authServicePath + "/api/notifications/task-completion")
                    .queryParam("submitterUserId", submitterUserId)
                    .queryParam("formTitle", formTitle)
                    .queryParam("reviewerName", reviewerName)
                    .queryParam("completionDate", completionDate)
                    .queryParam("status", status)
                    .toUriString();

            String response = restTemplate.postForObject(url, null, String.class);
            log.info("Task completion notification sent successfully: {}", response);
        } catch (Exception e) {
            log.error("Failed to send task completion notification: {}", e.getMessage());
            // Don't throw exception to avoid disrupting the workflow
        }
    }
}
