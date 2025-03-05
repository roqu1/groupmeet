# GroupMeet Project

This is a full-stack application built with React (TypeScript) frontend, Spring Boot backend, and PostgreSQL database.

## Prerequisites

Before you begin, ensure you have the following installed:

- Docker and Docker Compose
- Node.js (v18 or higher recommended)
- Java JDK 17 or higher
- Git

## Initial Setup

1. Clone the repository:

```bash
git clone https://github.com/roqu1/groupmeet.git
cd groupmeet
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

3. Build and start the application using Docker Compose:

```bash
docker-compose up --build
```

This command will:

- Build and start the frontend (React) on port 5173
- Build and start the backend (Spring Boot) on port 8080
- Start PostgreSQL database on port 5432

## Development Mode

### Frontend Development (Hot Reload)

```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:5173 with hot reload enabled.

### Backend Development (Hot Reload)

```bash
cd backend
./gradlew bootRun
```

The backend will be available at http://localhost:8080 with hot reload enabled.

### Database Development

The PostgreSQL database is accessible at:

- Host: localhost
- Port: 5432
- Database: groupmeet
- Username: postgres
- Password: postgres

## Project Structure

- `frontend/` - React TypeScript application (v19.0.0) built with Vite (v6.2.0)
  - Uses TypeScript for type safety
  - Includes ESLint for code quality
  - Hot Module Replacement (HMR) enabled
- `backend/` - Spring Boot application (v3.4.3)
  - JPA/Hibernate for database operations
  - RESTful API endpoints
  - Hot reload enabled with spring-boot-devtools
- `docker-compose.yml` - Container orchestration
  - Frontend container (Node.js 18)
  - Backend container (JDK 17)
  - PostgreSQL 15 container

## Environment Variables

### Frontend (.env)

- `VITE_API_URL`: Backend API URL

### Backend (application.properties)

- `SPRING_DATASOURCE_URL`: PostgreSQL connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `SPRING_JPA_HIBERNATE_DDL_AUTO`: Database schema update behavior

### Database

- `POSTGRES_DB`: Database name (groupmeet)
- `POSTGRES_USER`: Database username (postgres)
- `POSTGRES_PASSWORD`: Database password (postgres)

## Running Tests

### Frontend Tests

```bash
cd frontend
npm run test
```

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
