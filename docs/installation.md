# Installation Guide

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

## Environment Configuration

The application uses environment variables for configuration. The main configuration is through the root `.env` file.

See the [Environment Variables](environment-variables.md) section for more details.

## Starting the Application

1.  **Build and start the application using Docker Compose:**

    ```bash
    docker-compose up --build
    ```

    This command will:
    *   Build and start the frontend (React) on port 5173
    *   Build and start the backend (Spring Boot) on port 8080 (reading secrets from `.env`)
    *   Start PostgreSQL database on port 5432

2.  **Verify installation:**
    
    After starting the application, verify that everything is working correctly by:
    
    * Frontend: Open `http://localhost:5173` in your browser
    * Backend: Check if the API is running at `http://localhost:8080/api/test`
    * Database: Ensure PostgreSQL is running on port 5432

    Available API endpoints for verification:
    ```
    GET /api/test - Public test endpoint
    POST /api/auth/register - Registration
    POST /api/auth/login - Login
    POST /api/auth/logout - Logout
    GET /api/auth/me - Current user information
    ```
