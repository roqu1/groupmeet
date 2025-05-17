# Troubleshooting Guide

## Common Issues

### Database Connection Problems
If the backend can't connect to the database:
```
# Check if PostgreSQL container is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs db

# Restart the database
docker-compose restart db
```

### Sequence ID Issues
If you encounter "duplicate key value violates unique constraint" errors, see the [Sequence Reset](database-maintenance.md#sequence-reset) section.

### CORS Errors
If you're seeing CORS errors in the browser console:
```
# Ensure CORS settings match your environment
# Check docker-compose.yml and .env file

# Make sure frontend is connecting to the correct backend URL
# Check VITE_API_URL in frontend/.env
```

### JWT Authentication Issues
If authentication doesn't work properly:
```
# Check if JWT_SECRET is properly set in .env file
# Ensure cookies are being set (check browser's developer tools)
# Clear browser cookies and try again
```

For more help, please open an issue on the project's GitHub repository.
