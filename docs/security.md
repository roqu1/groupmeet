# Security Overview

-   **Authentication:** Uses JSON Web Tokens (JWT) stored in `HttpOnly`, `SameSite=Lax` cookies (default name `accessToken`).
    -   The `Secure` flag for the JWT cookie is currently set to `false` in `AuthController.java` (e.g., `.secure(false)`). **For production, this MUST be `true` and the application MUST be served over HTTPS.**
-   **CSRF Protection:** Employs the Double Submit Cookie pattern. The backend issues a readable `XSRF-TOKEN` cookie, and the frontend sends its value back in the `X-XSRF-TOKEN` header for state-changing requests (POST, PUT, DELETE).
-   **HTTPS:** Essential for production to protect cookies (especially if the `Secure` flag is enabled) and general data in transit.
-   **Secrets:** The `JWT_SECRET` is critical and managed via the `.env` file (locally) and should *never* be committed to Git. Use appropriate secret management in production environments.
-   **Token Management:**
    -   Logout: The backend clears the JWT cookie upon logout. As the session management is stateless (`SessionCreationPolicy.STATELESS`), there's no server-side session tied to the JWT to invalidate beyond the cookie.
    -   Password Reset: Password reset links use short-lived JWTs sent via email.
-   **Password Security:** Passwords are stored using BCrypt hashing algorithm.
-   **Rate Limiting:** Basic rate limiting is implemented for password reset requests.

## Technical Details

### Entity Relationship Model

The application uses the following main entities:
- **User**: Stores user account information, profile details (name, gender, location, about me, avatar URL, pro status), and associations to interests.
- **Interest**: Represents user interests or meeting types/categories (e.g., Sport, Musik). Users can have multiple interests, and meetings can be categorized by multiple interests.
- **Location**: Represents predefined locations that can be associated with users or meetings.
- **Friendship**: Manages relationships between two users, including status (PENDING, ACCEPTED, DECLINED).
- **Meeting**: Details about a meeting event, including title, description, format (ONLINE/OFFLINE), location (if offline), date/time, maximum participants, creator, associated meeting types (Interests), and participants.
- **BlockedMeetingParticipant**: Records users who are blocked from participating in a specific meeting by the meeting's organizer.

### Security Implementation

#### Authentication Flow

1. User registers with gender, name, username, email, and password (password is hashed with BCrypt).
2. On login, credentials are validated. If correct:
   - A JWT is generated and set as an `HttpOnly`, `SameSite=Lax` cookie. The `Secure` flag's status depends on the `isDevEnvironment()` check but is noted to be `false` for production due to issues.
   - An `XSRF-TOKEN` cookie (readable by JavaScript) is set for CSRF protection.
3. For protected requests:
   - The backend validates the JWT from the cookie.
   - For state-changing requests (POST, PUT, DELETE), the frontend includes the `XSRF-TOKEN` value in the `X-XSRF-TOKEN` header.
   - If the JWT is invalid/expired or CSRF validation fails, the user is typically met with an unauthorized error.

#### CSRF Protection Details

The application uses Spring Security's built-in CSRF protection with the Double Submit Cookie pattern:
```java
// In SecurityConfig.java
http
    .csrf(csrf -> csrf
        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()) // Creates XSRF-TOKEN cookie readable by JS
        .csrfTokenRequestHandler(requestHandler) // Uses custom handler (default might be null for _csrf attribute name)
        .ignoringRequestMatchers(
            new AntPathRequestMatcher("/**", "GET"), // Typically safe methods
            // ... other safe methods or specific paths
        )
    );