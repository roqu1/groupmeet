# GroupMeet Project

This is a full-stack application built with React (TypeScript) frontend, Spring Boot backend, and PostgreSQL database. It features JWT-based authentication using HttpOnly cookies and CSRF protection.

*Last updated: May 17, 2025*

## Quick Start

```bash
# Clone the repository
git clone https://github.com/roqu1/groupmeet.git
cd groupmeet

# Create .env file with JWT secret (required)
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env

# Start the application
docker-compose up --build
```

Once started:
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8080/api/test](http://localhost:8080/api/test)

## Documentation

Detailed documentation is available in the [docs](docs) directory:

- [📑 Installation Guide](docs/installation.md)
- [💻 Development Guide](docs/development.md)
- [🏗️ Project Structure](docs/project-structure.md)
- [⚙️ Environment Variables](docs/environment-variables.md)
- [🔒 Security Overview](docs/security.md)
- [🗄️ Database Maintenance](docs/database-maintenance.md)
- [🧪 Testing Guide](docs/testing.md)
- [🚀 Deployment Guide](docs/deployment.md)
- [🔍 Troubleshooting Guide](docs/troubleshooting.md)
- [🔌 API Endpoints](docs/api-endpoints.md)

## Project Architecture

### Frontend
- React (v19.0.0) with TypeScript
- JWT authentication with cookie storage
- React Query for data fetching
- Modern UI with responsive design

### Backend
- Spring Boot (v3.4.3)
- Spring Security with JWT authentication
- PostgreSQL database with JPA/Hibernate
- RESTful API design

### Infrastructure
- Docker Compose for local development
- Environment-based configuration

## Contributing

To contribute to this project:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read the [Development Guide](docs/development.md) before contributing.

## License

[GNU General Public License v3.0](LICENSE)
