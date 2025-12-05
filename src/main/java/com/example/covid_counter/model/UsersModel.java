package com.example.covid_counter.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class UsersModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Mark whether the user has recently passed OTP (set true on successful verification).
    @Column(name = "verified")
    private Boolean verified;

    // Last OTP code sent to the user (for simple demo storage).
    @Column(name = "otp_code")
    private String otpCode;

    // When the OTP expires. After this time, the code is invalid.
    @Column(name = "otp_expires_at")
    private LocalDateTime otpExpiresAt;
}
