package com.example.covid_counter.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

/**
 * JwtUtil is responsible for:
 *  - Generating JWT tokens
 *  - Validating JWT tokens
 *  - Extracting data from JWT tokens (like email)
 *
 * NOTE:
 *  No Autowired is used. If you want to inject this class,
 *  simply create a constructor in AuthService and receive this class as a dependency.
 */
@Component
public class JwtUtil {

    // Secret key used to sign the token
    // IMPORTANT: In real production applications do NOT hard-code this.
    // Store in environment variables. Length >= 32 chars for HS256.
    private static final String SECRET = "SUPER_SECRET_KEY_SUPER_SECRET_KEY_32B";
    private final Key signingKey = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    // Token validity time (example: 24 hours)
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;

    /**
     * Creates a JWT token using user's email as the subject.
     *
     * @param email - the user's email
     * @return signed JWT token as String
     */
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)                        // payload: "sub": email
                .setIssuedAt(new Date())                  // token creation time
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // expiry time
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extracts user's email from token.
     *
     * @param token - the JWT token
     * @return email stored in "subject"
     */
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Validates the given token.
     *
     * @param token - the JWT token
     * @param email - the email to match against token subject
     * @return true if valid token & belongs to that user
     */
    public boolean validateToken(String token, String email) {
        String extractedEmail = extractEmail(token);
        return (extractedEmail.equals(email) && !isTokenExpired(token));
    }

    /**
     * Check if the given token is expired.
     */
    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    /**
     * Returns all claims (payload) from the token.
     */
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
