.PHONY: help backend-bash frontend-bash db-bash logs logs-backend logs-frontend logs-db up down build clean

# Default target
help:
	@echo "Available commands:"
	@echo "  backend-bash    - Enter backend container shell"
	@echo "  frontend-bash   - Enter frontend container shell"
	@echo "  db-bash         - Enter database container shell"
	@echo "  up              - Start all services"
	@echo "  down            - Stop all services"
	@echo "  build           - Build all services"
	@echo "  logs            - Show logs for all services"
	@echo "  logs-backend    - Show backend logs"
	@echo "  logs-frontend   - Show frontend logs"
	@echo "  logs-db         - Show database logs"
	@echo "  clean           - Remove all containers and volumes"

# Container access commands
backend-bash:
	docker-compose exec backend /bin/bash

frontend-bash:
	docker-compose exec frontend /bin/sh

db-bash:
	docker-compose exec db psql -U postgres -d groupmeet

# Docker compose commands
up:
	docker-compose up

down:
	docker-compose down

build:
	docker-compose build

# Logs commands
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f db

# Cleanup commands
clean:
	docker-compose down -v
	docker-compose rm -f
	docker system prune -f
