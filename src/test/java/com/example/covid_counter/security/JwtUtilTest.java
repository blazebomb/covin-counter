package com.example.covid_counter.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tiny, self-contained JUnit example that uses your real JwtUtil.
 * Comments walk through what each line is doing.
 */
class JwtUtilTest {

    // We instantiate the class under test directly.
    private final JwtUtil jwtUtil = new JwtUtil();

    @Test
    void generatesTokenAndValidatesIt() {
        // Arrange: pick a sample email to embed in the token.
        String email = "learner@example.com";

        // Act: generate a JWT for that email.
        String token = jwtUtil.generateToken(email);

        // Assert basic shape: token should not be null/blank.
        assertNotNull(token, "Token should be created");
        assertFalse(token.isBlank(), "Token should not be empty");

        // Extract the email back out of the token payload.
        assertEquals(email, jwtUtil.extractEmail(token), "Extracted email should match input");

        // validateToken should be true when the email matches,
        // and false when we pass a different email.
        assertTrue(jwtUtil.validateToken(token, email), "Token should validate for the same email");
        assertFalse(jwtUtil.validateToken(token, "other@example.com"), "Token should fail for different email");
    }
}
