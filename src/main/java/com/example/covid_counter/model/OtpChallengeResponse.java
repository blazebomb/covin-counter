package com.example.covid_counter.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Response returned after a successful password check.
 * Explains that an OTP was sent and includes expiry info.
 */
@Data
@AllArgsConstructor
public class OtpChallengeResponse {
    private String status;          // e.g., "OTP_REQUIRED"
    private String message;         // human-friendly text
    private String email;           // which email we sent to
    private LocalDateTime expiresAt; // when the OTP becomes invalid
}
