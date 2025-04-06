# GroupMeet Project

This is a full-stack application built with React (TypeScript) frontend, Spring Boot backend, and PostgreSQL database. It features JWT-based authentication using HttpOnly cookies and CSRF protection.

## Prerequisites

Before you begin, ensure you have the following installed:

-   Docker and Docker Compose
-   Node.js (v18 or higher recommended)
-   Java JDK 17 or higher
-   Git
-   OpenSSL (or another tool to generate secure random strings, usually pre-installed on Linux/macOS, available for Windows)

## Initial Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/roqu1/groupmeet.git
    cd groupmeet
    ```

2.  **Install frontend dependencies:**

    ```bash
    cd frontend
    npm install
    cd ..
    ```

3.  **Set up Environment File (`.env`):**
    *   Create a file named `.env` in the project's **root directory** (the same directory as `docker-compose.yml`).
    *   Generate a secure secret key for signing JWTs. Use OpenSSL or a similar tool:
        ```bash
        # Generates a secure Base64 encoded key (recommended, 32 bytes = 256 bits)
        openssl rand -base64 32
        ```
    *   Copy the generated key and add it to your `.env` file like this:
        ```dotenv
        # /.env (Example - DO NOT use this exact key!)
        JWT_SECRET=YOUR_SECURELY_GENERATED_KEY_HERE

        # Optional: You can also define the database password here if you don't want the default
        # POSTGRES_PASSWORD=your_local_db_password

        # Optional: Define CORS environment (local, docker, production)
        # CORS_ENVIRONMENT=local

        # Optional: Define JWT expiration time in milliseconds (default is 1 hour)
        # JWT_EXPIRATION_MS=3600000
        ```

4.  **Build and start the application using Docker Compose:**

    ```bash
    docker-compose up --build
    ```

    This command will:
    *   Build and start the frontend (React) on port 5173
    *   Build and start the backend (Spring Boot) on port 8080 (reading secrets from `.env`)
    *   Start PostgreSQL database on port 5432

## Development Mode

### Code Formatting

Before pushing your commits, always format your code:

```bash
# Format frontend code
cd frontend
npm run format
cd ..

# Backend code formatting is typically handled by IDE Prettier/formatter plugins
```

### Frontend Development (Hot Reload)

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` with hot reload enabled.

### Backend Development (Hot Reload)

```bash
cd backend
./gradlew bootRun
```

The backend will be available at `http://localhost:8080` with hot reload enabled. Ensure your local backend can connect to the Docker database (it might need adjustments if not running everything via `docker-compose up`). Alternatively, run the backend via `docker-compose up backend` for easier DB connection.

### Database Development

The PostgreSQL database (when run via Docker Compose) is accessible at:

-   Host: `localhost`
-   Port: `5432`
-   Database: `groupmeet`
-   Username: `postgres`
-   Password: `postgres` (or the value set in your `.env` file for `POSTGRES_PASSWORD`)

## Project Structure

-   `frontend/` - React TypeScript application (v19.0.0) built with Vite (v6.2.0)
    -   Uses TypeScript for type safety.
    -   Includes ESLint for code quality.
    -   Includes `AuthContext` for global state management and `ProtectedRoute`/`PublicOnlyRoute` for route access control.
    -   Hot Module Replacement (HMR) enabled.
-   `backend/` - Spring Boot application (v3.4.3)
    -   Includes Spring Security configured for stateless JWT authentication (via HttpOnly cookies) and CSRF protection.
    *   JPA/Hibernate for database operations.
    *   RESTful API endpoints under `/api`.
    *   Hot reload enabled with `spring-boot-devtools`.
-   `.env` - **(Not committed)** Stores local secrets like `JWT_SECRET`. Read by Docker Compose.
-   `docker-compose.yml` - Container orchestration for frontend, backend, and database.

## Environment Variables

### Root `.env` File (Local Development - DO NOT COMMIT)

This file is located in the project root and is read by `docker-compose up`. It **must** be added to `.gitignore`.

-   `JWT_SECRET`: **Required.** A secure, randomly generated secret key (at least 32 bytes/256 bits, Base64 encoded recommended) used to sign JWT tokens. Generate using `openssl rand -base64 32`.
-   `POSTGRES_PASSWORD`: Optional. The password for the local PostgreSQL database (defaults to `postgres` in `docker-compose.yml` if not set).
-   `CORS_ENVIRONMENT`: Optional. Controls CORS origins (`local`, `docker`, `production`). Defaults to `local` in `docker-compose.yml`.
-   `JWT_EXPIRATION_MS`: Optional. JWT token expiry time in milliseconds. Defaults to 3600000 (1 hour) in `docker-compose.yml`.

### Frontend (`frontend/.env`)

Vite uses this file specifically for frontend build-time variables prefixed with `VITE_`.

-   `VITE_BACKEND_URL`: Base URL for the backend API. Should typically point to where the backend is accessible from the *browser's perspective* (e.g., `http://localhost:8080` when running locally, or your domain in production). *Note: The example `docker-compose.yml` sets `VITE_API_URL` for the container, which might need adjustment depending on how you access the frontend.*

### Backend & Database (Configured via `docker-compose.yml` environment section)

These variables are set within the `docker-compose.yml` file, often reading values from the root `.env` file (using `${VARIABLE_NAME}` syntax).

-   `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
-   `SERVER_PORT`
-   `JWT_SECRET`, `JWT_EXPIRATION_MS`
-   `CORS_ENVIRONMENT`, `FRONTEND_DEV_URL`, `FRONTEND_DOCKER_URL`, `FRONTEND_PROD_URL`
-   `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

## Security Overview

-   **Authentication:** Uses JSON Web Tokens (JWT) stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies (`accessToken`). This prevents direct access to the token via JavaScript (mitigating XSS).
-   **CSRF Protection:** Employs the Double Submit Cookie pattern. The backend issues a readable `XSRF-TOKEN` cookie, and the frontend sends its value back in the `X-XSRF-TOKEN` header for state-changing requests (POST, PUT, DELETE).
-   **HTTPS:** Assumes deployment over HTTPS for the `Secure` cookie flag to be effective in production.
-   **Secrets:** The `JWT_SECRET` is critical and managed via the `.env` file (locally) and should *never* be committed to Git. Use appropriate secret management in production environments.

## Running Tests


### Backend Tests

```bash
cd backend
./gradlew test
```

## Stopping the Application

To stop all containers:

```bash
docker-compose down
```

To stop and remove all containers including the database volume:

```bash
docker-compose down -v
```
