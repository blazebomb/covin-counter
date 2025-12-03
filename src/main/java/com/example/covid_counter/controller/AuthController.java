package com.example.covid_counter.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.covid_counter.model.AuthRequest;
import com.example.covid_counter.model.AuthResponse;
import com.example.covid_counter.model.RegisterRequest;
import com.example.covid_counter.service.AuthService;

/**
 * AuthController:
 *  - Exposes HTTP endpoints for register and login
 *  - Talks to AuthService
 *  - For now, directly returns String JWT tokens
 */
@RestController
@CrossOrigin(
        origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"},
        allowCredentials = "true")
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    // constructor injection (no @Autowired)
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /auth/register
     * Body: { "name": "...", "email": "...", "password": "..." }
     * Returns: { "token": "...", "email": "..." }
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse auth = authService.registerUser(request);
        return withTokenCookie(auth);
    }

    /**
     * POST /auth/login
     * Body: { "email": "...", "password": "..." }
     * Returns: { "token": "...", "email": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        AuthResponse auth = authService.loginUser(request);
        return withTokenCookie(auth);
    }

    /**
     * POST /auth/logout
     * Stateless JWT logout: tell client to discard its token.
     * If a cookie was used, this also expires it.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie expired = ResponseCookie.from("Authorization", "")
                .path("/")
                .httpOnly(true)
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, expired.toString());
        return ResponseEntity.ok(java.util.Map.of("message", "Logged out. Remove token on client."));
    }

    private ResponseEntity<AuthResponse> withTokenCookie(AuthResponse auth) {
        ResponseCookie cookie = ResponseCookie.from("Authorization", auth.getToken())
                .path("/")
                .httpOnly(true)
                .maxAge(24 * 60 * 60)
                .sameSite("Lax")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(auth);
    }
}
