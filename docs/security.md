# Security Overview

-   **Authentication:** Uses JSON Web Tokens (JWT) stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies (`accessToken`). This prevents direct access to the token via JavaScript (mitigating XSS).
-   **CSRF Protection:** Employs the Double Submit Cookie pattern. The backend issues a readable `XSRF-TOKEN` cookie, and the frontend sends its value back in the `X-XSRF-TOKEN` header for state-changing requests (POST, PUT, DELETE).
-   **HTTPS:** Assumes deployment over HTTPS for the `Secure` cookie flag to be effective in production.
-   **Secrets:** The `JWT_SECRET` is critical and managed via the `.env` file (locally) and should *never* be committed to Git. Use appropriate secret management in production environments.
-   **Token Management:** The front-end automatically refreshes the JWT token when needed and handles logout by clearing server-side session data. The backend invalidates tokens on logout and enforces secure token rotation practices.
-   **Password Security:** Passwords are stored using BCrypt hashing algorithm with appropriate work factors.

## Technical Details

### Entity Relationship Model

The application uses the following main entities:
- **User** - User account information including authentication details
- **Friendship** - Represents a friendship relationship between two users (with status: pending, accepted)
- **PasswordResetToken** - For password reset functionality

### Security Implementation 

#### Authentication Flow

1. User registers with username, email and password (password is hashed with BCrypt)
2. On login, credentials are validated, and if correct:
   - JWT token is generated and stored in HttpOnly cookie
   - XSRF token is set in readable cookie for CSRF protection
3. For protected requests:
   - Backend validates JWT from cookie
   - Frontend includes XSRF token in request headers
   - If invalid/expired, user is redirected to login

#### CSRF Protection Details

The application uses the Double Submit Cookie pattern:
```
// In SecurityConfig.java
http.csrf(csrf -> csrf
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()) // Creates XSRF-TOKEN cookie
    .csrfTokenRequestHandler(requestHandler)
    // Ignored for safe methods (GET, HEAD, OPTIONS)
);
```
