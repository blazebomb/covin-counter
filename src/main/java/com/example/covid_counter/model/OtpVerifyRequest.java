package com.example.covid_counter.model;

import lombok.Data;

/**
 * Payload for verifying the OTP step.
 */
@Data
public class OtpVerifyRequest {
    private String email;
    private String code;
}
