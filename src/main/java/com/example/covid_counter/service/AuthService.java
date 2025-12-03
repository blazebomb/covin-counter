package com.example.covid_counter.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import com.example.covid_counter.model.AuthRequest;
import com.example.covid_counter.model.AuthResponse;
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

    // Constructor injection (no @Autowired)
    public AuthService(UsersRepo usersRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.usersRepo = usersRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
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

        usersRepo.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail());
    }

    /**
     * Login:
     *  - find user by email
     *  - check password
     *  - return JWT token if OK
     */
    public AuthResponse loginUser(AuthRequest request) {
        UsersModel user = usersRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        if (!matches) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail());
    }
}
