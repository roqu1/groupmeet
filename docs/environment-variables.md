# Environment Variables

## Root `.env` File (Local Development - DO NOT COMMIT)

This file is located in the project root and is read by `docker-compose up`. It **must** be added to `.gitignore`.

-   `JWT_SECRET`: **Required.** A secure, randomly generated secret key (at least 32 bytes/256 bits, Base64 encoded recommended) used to sign JWT tokens. Generate using `openssl rand -base64 32`.
-   `POSTGRES_PASSWORD`: Optional. The password for the local PostgreSQL database (defaults to `postgres` in `docker-compose.yml` if not set).
-   `CORS_ENVIRONMENT`: Optional. Controls CORS origins (`local`, `docker`, `production`). Defaults to `local` in `docker-compose.yml`.
-   `JWT_EXPIRATION_MS`: Optional. JWT token expiry time in milliseconds. Defaults to 3600000 (1 hour) in `docker-compose.yml`.

## Frontend (`frontend/.env`)

Vite uses this file specifically for frontend build-time variables prefixed with `VITE_`.

-   `VITE_BACKEND_URL`: Base URL for the backend API. Should typically point to where the backend is accessible from the *browser's perspective* (e.g., `http://localhost:8080` when running locally, or your domain in production). Note that:
    -  The `.env` file is ignored by git (listed in `.gitignore`)
    -  The example `docker-compose.yml` sets `VITE_API_URL=http://backend:8080` for the container
    -  Locally the application uses Vite's proxy configuration to route API requests

## Backend & Database (Configured via `docker-compose.yml` environment section)

These variables are set within the `docker-compose.yml` file, often reading values from the root `.env` file (using `${VARIABLE_NAME}` syntax).

-   `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
-   `SERVER_PORT`
-   `JWT_SECRET`, `JWT_EXPIRATION_MS`
-   `CORS_ENVIRONMENT`, `FRONTEND_DEV_URL`, `FRONTEND_DOCKER_URL`, `FRONTEND_PROD_URL`
-   `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
