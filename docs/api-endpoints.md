# API Endpoints

The application exposes the following main API endpoints:

## Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive authentication cookie
- `POST /api/auth/logout` - Logout and invalidate token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user information

## Friends
- `GET /api/friends` - Get all friends (paginated)
- `DELETE /api/friends/{friendId}` - Remove a friend
- `POST /api/friends/requests/{targetUserId}` - Send friend request
- `GET /api/friends/requests` - Get all friend requests (paginated)
- `PUT /api/friends/requests/{requestId}/accept` - Accept friend request
- `DELETE /api/friends/requests/{requestId}` - Reject/cancel friend request

## Users
- `GET /api/users/search` - Search users by username, first name, or last name

## Test
- `GET /api/test` - Test endpoint for checking API connectivity

All protected endpoints require authentication via JWT stored in HttpOnly cookie.
