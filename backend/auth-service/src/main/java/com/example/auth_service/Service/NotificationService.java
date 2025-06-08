package com.example.auth_service.Service;

import com.example.auth_service.Entity.User;
import com.example.auth_service.Entity.Notification;
import com.example.auth_service.Repository.UserRepository;
import com.example.auth_service.Repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    // =================== EMAIL NOTIFICATION METHODS ===================

    /**
     * Sends notification emails to all users with the specified role
     * when a new form is submitted and requires their review
     */
    public void notifyUsersOfFormSubmission(String targetRole, String formTitle, 
                                          String submitterName, String submissionDate) {
        try {
            List<User> usersWithRole = userRepository.findByRoleName(targetRole);
            
            if (usersWithRole.isEmpty()) {
                System.out.println("Warning: No users found with role: " + targetRole);
                return;
            }

            System.out.println("Sending form submission notifications to " + usersWithRole.size() + 
                             " users with role: " + targetRole);

            for (User user : usersWithRole) {
                try {
                    // Send email notification
                    sendFormSubmissionNotification(user, formTitle, submitterName, submissionDate, targetRole);
                    
                    // Create persistent notification
                    createNotification(user.getId(), 
                        "New Form Submission - " + formTitle,
                        "A new form '" + formTitle + "' has been submitted by " + submitterName + 
                        " on " + submissionDate + " and requires your review.",
                        "FORM_SUBMISSION", 
                        null, "FORM");
                        
                } catch (Exception e) {
                    System.err.println("Failed to send notification to user: " + user.getEmail() + " - " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send form submission notifications for role: " + targetRole + " - " + e.getMessage());
        }
    }

    /**
     * Sends notification to the form submitter when their task is completed
     */
    public void notifySubmitterOfTaskCompletion(Long submitterUserId, String formTitle,
                                              String reviewerName, String completionDate, String status) {
        try {
            Optional<User> submitterOpt = userRepository.findById(submitterUserId);
            if (submitterOpt.isEmpty()) {
                System.err.println("Warning: User not found with ID: " + submitterUserId);
                return;
            }

            User submitter = submitterOpt.get();
            
            // Send email notification
            sendTaskCompletionNotification(submitter, formTitle, reviewerName, completionDate, status);
            
            // Create persistent notification
            createNotification(submitter.getId(),
                "Task Completed - " + formTitle,
                "Your form '" + formTitle + "' has been reviewed by " + reviewerName + 
                " on " + completionDate + ". Status: " + status,
                "TASK_COMPLETION",
                null, "FORM");
                
            System.out.println("Sent task completion notification to user: " + submitter.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send task completion notification to user ID: " + submitterUserId + " - " + e.getMessage());
        }
    }

    private void sendFormSubmissionNotification(User user, String formTitle, String submitterName,
                                              String submissionDate, String role) {
        try {
            String subject = "New Form Submission Requires Your Review - " + formTitle;
            String message = buildFormSubmissionMessage(user.getFirstname(), formTitle,
                                                      submitterName, submissionDate, role);
            
            emailService.sendEmail(user.getEmail(), subject, message);
            System.out.println("Sent form submission notification to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send form submission email to: " + user.getEmail() + " - " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    private void sendTaskCompletionNotification(User user, String formTitle, String reviewerName,
                                              String completionDate, String status) {
        try {
            String subject = "Form Review Completed - " + formTitle;
            String message = buildTaskCompletionMessage(user.getFirstname(), formTitle,
                                                       reviewerName, completionDate, status);
            
            emailService.sendEmail(user.getEmail(), subject, message);
            System.out.println("Sent task completion notification to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send task completion email to: " + user.getEmail() + " - " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    private String buildFormSubmissionMessage(String firstName, String formTitle, String submitterName,
                                            String submissionDate, String role) {
        return String.format("""
            Hello %s,
            
            A new form submission requires your attention:
            
            Form Title: %s
            Submitted by: %s
            Submission Date: %s
            Assigned Role: %s
            
            Please log into the system to review this submission.
            
            Best regards,
            ST2I System
            """, firstName, formTitle, submitterName, submissionDate, role);
    }

    private String buildTaskCompletionMessage(String firstName, String formTitle, String reviewerName,
                                            String completionDate, String status) {
        return String.format("""
            Hello %s,
            
            Your form submission has been reviewed:
            
            Form Title: %s
            Reviewed by: %s
            Completion Date: %s
            Status: %s
            
            You can view the details by logging into the system.
            
            Best regards,
            ST2I System
            """, firstName, formTitle, reviewerName, completionDate, status);
    }

    // =================== PERSISTENT NOTIFICATION METHODS ===================

    /**
     * Create a new notification
     */
    public Notification createNotification(Long userId, String title, String message, String type) {
        Notification notification = new Notification(userId, title, message, type);
        return notificationRepository.save(notification);
    }

    /**
     * Create a new notification with related entity information
     */
    public Notification createNotification(Long userId, String title, String message, String type,
                                         Long relatedEntityId, String relatedEntityType) {
        Notification notification = new Notification(userId, title, message, type, relatedEntityId, relatedEntityType);
        return notificationRepository.save(notification);
    }

    /**
     * Get all notifications for a user
     */
    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get notifications for a user with pagination
     */
    public Page<Notification> getNotificationsByUserId(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * Get unread notifications for a user
     */
    public List<Notification> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    /**
     * Get unread notification count for a user
     */
    public int getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /**
     * Mark a notification as read
     */
    public boolean markNotificationAsRead(Long notificationId, Long userId) {
        int updated = notificationRepository.markAsRead(notificationId, userId, LocalDateTime.now());
        return updated > 0;
    }

    /**
     * Mark all notifications as read for a user
     */
    public int markAllNotificationsAsRead(Long userId) {
        return notificationRepository.markAllAsRead(userId, LocalDateTime.now());
    }

    /**
     * Get a specific notification by ID
     */
    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    /**
     * Delete old notifications (older than 30 days)
     */
    public int deleteOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        return notificationRepository.deleteOldNotifications(cutoffDate);
    }

    /**
     * Get recent notifications (within last 7 days)
     */
    public List<Notification> getRecentNotifications(Long userId) {
        LocalDateTime fromDate = LocalDateTime.now().minusDays(7);
        return notificationRepository.findRecentNotifications(userId, fromDate);
    }
}
