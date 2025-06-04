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
- `GET /api/friends` - Get all friends (paginated, supports `searchTerm`)
- `DELETE /api/friends/{friendId}` - Remove a friend
- `POST /api/friends/requests/{targetUserId}` - Send friend request
- `GET /api/friends/requests/incoming` - Get all incoming friend requests (paginated)
- `PUT /api/friends/requests/{requestId}/accept` - Accept friend request
- `DELETE /api/friends/requests/{requestId}/reject` - Reject or cancel a friend request

## Users
- `GET /api/users/search` - Search users. Supports query parameters: `searchTerm`, `genders`, `location`, `interests`, and pagination.
- `GET /api/users/{userId}/profile` - Get a specific user's profile information.
- `GET /api/users/{userId}/meetings` - Get meetings a specific user is participating in (paginated).
- `POST /api/users/subscribe` - Subscribe the current authenticated user to Pro.

## Current User Profile
- `GET /api/user/profile` - Get the current authenticated user's profile.
- `PUT /api/user/profile` - Update the current authenticated user's profile.

## Meetings (Groups)
- `POST /api/meetings` - Create a new meeting.
- `GET /api/meetings/search` - Search for meetings. Supports query parameters: `searchTerm`, `types`, `location`, `format`, `startDate`, `endDate`, and pagination.
- `GET /api/meetings/{meetingId}` - Get details for a specific meeting.
- `PUT /api/meetings/{meetingId}` - Update a specific meeting (organizer only).
- `DELETE /api/meetings/{meetingId}` - Delete a specific meeting (organizer only).
- `POST /api/meetings/{meetingId}/join` - Join a meeting.
- `POST /api/meetings/{meetingId}/leave` - Leave a meeting.
- `GET /api/meetings/{meetingId}/participants-details` - Get detailed list of participants for a meeting (paginated, supports `searchTerm`).
- `POST /api/meetings/{meetingId}/participants/{userId}/block` - Block a user from a meeting (organizer only).
- `DELETE /api/meetings/{meetingId}/participants/{userId}/block` - Unblock a user from a meeting (organizer only).
- `DELETE /api/meetings/{meetingId}/participants/{userId}/remove` - Remove a participant from a meeting (organizer only).

## Meta Data (Interests & Locations)
- `GET /api/interests` - Get a list of available interests.
- `GET /api/locations` - Get a list of available locations.

## Test
- `GET /api/test` - Test endpoint for checking API connectivity.

All protected endpoints require authentication via JWT stored in an HttpOnly cookie. CSRF protection is in place for state-changing requests.