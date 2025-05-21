# Email Setup for Auth Service

This document explains how to set up email functionality for the Auth Service using Gmail.

## Gmail Configuration

To use Gmail for sending emails from the application, follow these steps:

### 1. Create or Use an Existing Gmail Account

You'll need a Gmail account to send emails from. You can use an existing account or create a new one specifically for your application.

### 2. Enable "Less Secure Apps" or Generate an App Password

You have two options:

#### Option A: Enable "Less Secure Apps" (Not recommended for production)

1. Go to your Google Account settings: https://myaccount.google.com/
2. Select "Security" from the left menu
3. Scroll down to "Less secure app access" and turn it on
   - Note: Google may disable this option for accounts with enhanced security

#### Option B: Generate an App Password (Recommended)

1. Enable 2-Step Verification for your Google account
   - Go to https://myaccount.google.com/security
   - Under "Signing in to Google," select "2-Step Verification" and follow the steps

2. Generate an App Password
   - After enabling 2-Step Verification, go back to the Security page
   - Under "Signing in to Google," select "App passwords"
   - Select "Mail" as the app and "Other" as the device (give it a name like "My Spring App")
   - Click "Generate"
   - Google will display a 16-character password - save this password

### 3. Configure Environment Variables

Set the following environment variables in your development environment:

```bash
export EMAIL_USERNAME=your-email@gmail.com
export EMAIL_PASSWORD=your-app-password-or-gmail-password
```

For production, set these environment variables in your deployment environment or CI/CD pipeline.

### 4. Testing the Email Configuration

You can test if your email configuration is working by:

1. Starting the auth-service
2. Creating a new user through the admin interface
3. Checking if the welcome email is received at the specified email address

## Using Local Mail Server for Development

For development purposes, you can use MailDev which is already configured in the Docker setup:

1. Comment out the Gmail configuration in `application.properties`
2. Uncomment the MailDev configuration
3. Start the MailDev container
4. Access the MailDev UI at http://localhost:1080 to see sent emails

## Troubleshooting

If emails are not being sent:

1. Check the application logs for any error messages
2. Verify that the environment variables are set correctly
3. If using Gmail, ensure that "Less Secure Apps" is enabled or that the App Password is correct
4. Check if your Gmail account has any restrictions or if Google has blocked the sign-in attempt

## Security Considerations

- Never commit email credentials to version control
- Use environment variables or a secure configuration service to manage credentials
- Consider using a dedicated email service provider for production environments
