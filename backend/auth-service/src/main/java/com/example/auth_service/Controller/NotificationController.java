package com.example.auth_service.Controller;

import com.example.auth_service.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Endpoint to send form submission notifications to users with a specific role
     */
    @PostMapping("/form-submission")
    public ResponseEntity<String> notifyFormSubmission(
            @RequestParam String targetRole,
            @RequestParam String formTitle,
            @RequestParam String submitterName,
            @RequestParam String submissionDate) {
        
        try {
            log.info("Received form submission notification request for role: {}", targetRole);
            
            notificationService.notifyUsersOfFormSubmission(targetRole, formTitle, 
                                                          submitterName, submissionDate);
            
            return ResponseEntity.ok("Form submission notifications sent successfully");
        } catch (Exception e) {
            log.error("Failed to send form submission notifications: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Failed to send notifications: " + e.getMessage());
        }
    }

    /**
     * Endpoint to send task completion notification to the form submitter
     */
    @PostMapping("/task-completion")
    public ResponseEntity<String> notifyTaskCompletion(
            @RequestParam Long submitterUserId,
            @RequestParam String formTitle,
            @RequestParam String reviewerName,
            @RequestParam String completionDate,
            @RequestParam(defaultValue = "Completed") String status) {
        
        try {
            log.info("Received task completion notification request for user ID: {}", submitterUserId);
            
            notificationService.notifySubmitterOfTaskCompletion(submitterUserId, formTitle,
                                                              reviewerName, completionDate, status);
            
            return ResponseEntity.ok("Task completion notification sent successfully");
        } catch (Exception e) {
            log.error("Failed to send task completion notification: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Failed to send notification: " + e.getMessage());
        }
    }
}
