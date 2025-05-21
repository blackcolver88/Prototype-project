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
}
