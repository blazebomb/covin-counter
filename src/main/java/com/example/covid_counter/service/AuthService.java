package com.example.covid_counter.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Random;

import com.example.covid_counter.model.AuthRequest;
import com.example.covid_counter.model.AuthResponse;
import com.example.covid_counter.model.OtpChallengeResponse;
import com.example.covid_counter.model.RegisterRequest;
import com.example.covid_counter.model.UsersModel;
import com.example.covid_counter.repo.UsersRepo;
import com.example.covid_counter.security.JwtUtil;

/**
 * AuthService:
 *  - Handles register and login logic
 *  - Talks to UsersRepo (DB)
 *  - Uses PasswordEncoder to hash/verify passwords
 *  - Uses JwtUtil to generate JWT tokens
 */
@Service
public class AuthService {

    private final UsersRepo usersRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MailService mailService;

    // Constructor injection (no @Autowired)
    public AuthService(UsersRepo usersRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, MailService mailService) {
        this.usersRepo = usersRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.mailService = mailService;
    }

    /**
     * Register a new user:
     *  - hash password
     *  - save user in DB
     *  - return a JWT token for that user
     */
    public AuthResponse registerUser(RegisterRequest request) {
        usersRepo.findByEmail(request.getEmail()).ifPresent(u -> {
            throw new RuntimeException("Email already registered");
        });

        UsersModel user = new UsersModel();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setVerified(false);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);

        usersRepo.save(user);

        // We do NOT return a JWT on register; user must log in and pass OTP.
        return new AuthResponse(null, user.getEmail());
    }

    /**
     * Login (step 1 of 2FA):
     *  - find user by email
     *  - check password
     *  - generate OTP, store and "send" it
     *  - return an OTP_REQUIRED response (no JWT yet)
     */
    public OtpChallengeResponse loginUser(AuthRequest request) {
        UsersModel user = usersRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        if (!matches) {
            throw new RuntimeException("Invalid credentials");
        }

        String otp = generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plus(5, ChronoUnit.MINUTES);

        // Persist OTP for later verification.
        user.setOtpCode(otp);
        user.setOtpExpiresAt(expiresAt);
        user.setVerified(false);
        user.setUpdatedAt(LocalDateTime.now());
        usersRepo.save(user);

        // Send the OTP via email. (In dev, check logs/console of your mail provider or catch errors.)
        sendOtp(user.getEmail(), otp, expiresAt);

        return new OtpChallengeResponse(
                "OTP_REQUIRED",
                "We sent a 6-digit code to your email. Enter it to finish login.",
                user.getEmail(),
                expiresAt
        );
    }

    /**
     * Verify the OTP (step 2 of 2FA):
     *  - confirm user exists
     *  - check code matches and is not expired
     *  - mark verified, clear OTP, issue JWT
     */
    public AuthResponse verifyOtp(String email, String code) {
        UsersModel user = usersRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtpCode() == null || user.getOtpExpiresAt() == null) {
            throw new RuntimeException("No OTP pending. Please login again.");
        }

        if (LocalDateTime.now().isAfter(user.getOtpExpiresAt())) {
            throw new RuntimeException("OTP expired. Please login again.");
        }

        if (!user.getOtpCode().equals(code)) {
            throw new RuntimeException("Invalid OTP code.");
        }

        // Success: clear OTP data and mark verified.
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        user.setVerified(true);
        user.setUpdatedAt(LocalDateTime.now());
        usersRepo.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail());
    }

    // ---- Helpers ----

    private static String generateOtp() {
        // 6-digit numeric code; not cryptographically strong, but fine for demo.
        int code = 100000 + new Random().nextInt(900000);
        return String.valueOf(code);
    }

    private void sendOtp(String email, String otp, LocalDateTime expiresAt) {
        try {
            mailService.sendOtp(email, otp, expiresAt);
        } catch (Exception e) {
            // For learning: log and rethrow. In production, handle gracefully.
            System.err.println("[OTP] Failed to send email: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email. Please try again.");
        }
    }
}
