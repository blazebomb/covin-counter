package com.example.covid_counter.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Small helper to send OTP emails.
 * Uses Spring's JavaMailSender and values from application.properties.
 */
@Service
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send a plain-text OTP email.
     * For real use, adjust subject/body to your needs and HTML if desired.
     */
    public void sendOtp(String toEmail, String otpCode, LocalDateTime expiresAt) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Your login code");
        message.setText("Your one-time code is: " + otpCode +
                "\nThis code expires at: " + expiresAt +
                "\nIf you did not request this, please ignore.");

        mailSender.send(message);
    }
}
