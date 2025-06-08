package com.example.auth_service.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    /**
     * Sends an email with the given parameters
     *
     * @param to      recipient email address
     * @param subject email subject
     * @param text    email content (HTML)
     */
    public void sendEmail(String to, String subject, String text) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(text, true); // true indicates HTML content
        
        mailSender.send(message);
    }

    /**
     * Sends a welcome email with credentials to a newly created user
     *
     * @param email     user's email address
     * @param firstName user's first name
     * @param lastName  user's last name
     * @param password  user's password (in plain text)
     * @param role      user's role
     */
    public void sendWelcomeEmail(String email, String firstName, String lastName, String password, String role) {
        try {
            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("lastName", lastName);
            context.setVariable("email", email);
            context.setVariable("password", password);
            context.setVariable("role", role);
            
            String emailContent = templateEngine.process("welcome-email", context);
            
            sendEmail(email, "Welcome to Our Application - Your Account Details", emailContent);
        } catch (MessagingException e) {
            // Log the error but don't throw it to prevent disrupting the registration flow
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }

    /**
     * Sends a notification email when a form is submitted and assigned to a role
     *
     * @param email          recipient's email address
     * @param firstName      recipient's first name
     * @param lastName       recipient's last name
     * @param formTitle      title of the submitted form
     * @param submitterName  name of the person who submitted the form
     * @param submissionDate date when the form was submitted
     * @param role           role assigned to review the form
     */
    public void sendFormSubmissionNotification(String email, String firstName, String lastName, 
                                             String formTitle, String submitterName, 
                                             String submissionDate, String role) {
        try {
            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("lastName", lastName);
            context.setVariable("formTitle", formTitle);
            context.setVariable("submitterName", submitterName);
            context.setVariable("submissionDate", submissionDate);
            context.setVariable("role", role);
            
            String emailContent = templateEngine.process("form-submission-notification", context);
            
            sendEmail(email, "New Form Submission Requires Your Review - " + formTitle, emailContent);
        } catch (MessagingException e) {
            // Log the error but don't throw it to prevent disrupting the workflow
            System.err.println("Failed to send form submission notification: " + e.getMessage());
        }
    }

    /**
     * Sends a notification email when a task is completed
     *
     * @param email         recipient's email address
     * @param firstName     recipient's first name
     * @param lastName      recipient's last name
     * @param formTitle     title of the form
     * @param reviewerName  name of the person who completed the review
     * @param completionDate date when the task was completed
     * @param status        completion status (approved/rejected/etc.)
     */
    public void sendTaskCompletionNotification(String email, String firstName, String lastName,
                                             String formTitle, String reviewerName,
                                             String completionDate, String status) {
        try {
            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("lastName", lastName);
            context.setVariable("formTitle", formTitle);
            context.setVariable("reviewerName", reviewerName);
            context.setVariable("completionDate", completionDate);
            context.setVariable("status", status);
            
            String emailContent = templateEngine.process("task-completion-notification", context);
            
            sendEmail(email, "Form Review Completed - " + formTitle, emailContent);
        } catch (MessagingException e) {
            // Log the error but don't throw it to prevent disrupting the workflow
            System.err.println("Failed to send task completion notification: " + e.getMessage());
        }
    }
}
