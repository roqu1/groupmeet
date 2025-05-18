# Development Guide

## Code Formatting

Before pushing your commits, always format your code:

```bash
# Format frontend code
cd frontend
npm run format
cd ..

# Backend code formatting is typically handled by IDE Prettier/formatter plugins
```

## Frontend Development (Hot Reload)

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` with hot reload enabled.

## Backend Development (Hot Reload)

```bash
cd backend
./gradlew bootRun
```

The backend will be available at `http://localhost:8080` with hot reload enabled. Ensure your local backend can connect to the Docker database (it might need adjustments if not running everything via `docker-compose up`). Alternatively, run the backend via `docker-compose up backend` for easier DB connection.

## Database Development

The PostgreSQL database (when run via Docker Compose) is accessible at:

-   Host: `localhost`
-   Port: `5432`
-   Database: `groupmeet`
-   Username: `postgres`
-   Password: `postgres` (or the value set in your `.env` file for `POSTGRES_PASSWORD`)
