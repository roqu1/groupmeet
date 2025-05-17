# Deployment Guide

## Stopping the Application

To stop all containers:

```bash
docker-compose down
```

To stop and remove all containers including the database volume:

```bash
docker-compose down -v
```

## Production Deployment

For production deployment, additional considerations are necessary:

1. **SSL/HTTPS Setup:**
   * Use a reverse proxy like Nginx with proper SSL certificates
   * Ensure all cookies have the `Secure` flag enabled

2. **Environment Variables:**
   * Use environment-specific configurations for production
   * Set `CORS_ENVIRONMENT=production` and configure proper CORS origins

3. **Security Hardening:**
   * Review and tighten security configurations before deployment
   * Use a proper secrets management solution instead of `.env` files

4. **Database Considerations:**
   * Use a managed database service or properly secured PostgreSQL instance
   * Set up regular backups and monitoring

5. **CI/CD Pipeline:**
   * Consider setting up automated testing and deployment workflows

Detailed production deployment instructions are beyond the scope of this documentation.
