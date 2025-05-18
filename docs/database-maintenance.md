# Database Maintenance

## Sequence Reset

PostgreSQL uses sequences for auto-incrementing IDs. Sometimes these sequences can get out of sync with the actual data (due to manual inserts, data migrations, etc.). If you encounter errors like "duplicate key value violates unique constraint" (error code SQLState: 23505), you may need to reset the sequences:

```bash
# Connect to PostgreSQL container
docker-compose exec db psql -U postgres -d groupmeet

# Inside PostgreSQL console, for a specific table
SELECT setval('table_name_id_seq', (SELECT MAX(id) FROM table_name), true);

# Example for friendships table
SELECT setval('friendships_id_seq', (SELECT MAX(id) FROM friendships), true);

# You can exit psql with \q
```

## Database Backup and Restore

To backup the database:

```bash
docker-compose exec db pg_dump -U postgres groupmeet > backup.sql
```

To restore from a backup:

```bash
# Stop the application first
docker-compose down

# Start only the database
docker-compose up -d db

# Wait a few seconds for the database to start
sleep 5

# Restore from backup
cat backup.sql | docker exec -i $(docker-compose ps -q db) psql -U postgres -d groupmeet

# Start the rest of the application
docker-compose up -d
```
