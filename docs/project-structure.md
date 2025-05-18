# Project Structure

-   `frontend/` - React TypeScript application (v19.0.0) built with Vite
    -   Uses TypeScript for type safety
    -   Includes ESLint and Prettier for code quality
    -   Uses React Router for navigation and React Hook Form for form management
    -   Uses Tanstack React Query for data fetching and state management
    -   Includes `AuthContext` for global state management and `ProtectedRoute`/`PublicOnlyRoute` for route access control
    -   API proxy configured in Vite (proxy: '/api' -> 'http://localhost:8080')
    -   Hot Module Replacement (HMR) enabled with Vite server
-   `backend/` - Spring Boot application (v3.4.3)
    -   Includes Spring Security with JWT authentication via HttpOnly cookies
    -   JPA/Hibernate for database operations with PostgreSQL
    -   RESTful API endpoints under `/api`
    -   JWT authentication with io.jsonwebtoken:jjwt (v0.12.6)
    -   Hot reload enabled with `spring-boot-devtools`
-   `.env` - **(Not committed)** Stores local secrets like `JWT_SECRET`. Read by Docker Compose
-   `docker-compose.yml` - Container orchestration for frontend, backend, and database
-   `docs/` - Project documentation
