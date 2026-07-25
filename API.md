# SIMBI KE API Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user with phone number and password.
```json
{
  "phone_number": "07XXXXXXXX",
  "password": "SecurePass123",
  "confirm_password": "SecurePass123"
}
```

### POST /api/auth/verify-otp
Verify OTP and complete registration.
```json
{
  "phone_number": "07XXXXXXXX",
  "otp_code": "123456",
  "password": "SecurePass123"
}
```

### POST /api/auth/login
Login with phone and password.
```json
{
  "phone_number": "07XXXXXXXX",
  "password": "SecurePass123",
  "remember_me": false
}
```

### POST /api/auth/logout
Logout current user (requires auth).

### GET /api/auth/me
Get current user profile (requires auth).

---

## Game Endpoints

### GET /api/game/rooms
Get all available game rooms.

### POST /api/game/join-queue
Join a game room queue (requires auth).
```json
{
  "room_id": "uuid",
  "auto_bet": false
}
```

### GET /api/game/queue-position
Get current queue position (requires auth).

### POST /api/game/leave-queue
Leave current queue (requires auth).

### POST /api/game/toss
Toss result after rolling (requires auth).
```json
{
  "match_id": "uuid",
  "result": ["WHITE", "BLACK", "WHITE", "BLACK"]
}
```

### GET /api/game/history
Get game history (requires auth).

---

## Payment Endpoints

### POST /api/payment/deposit
Initiate deposit (requires auth).
```json
{
  "amount": 1000,
  "payment_method": "MPESA",
  "phone_number": "254XXXXXXXXX"
}
```

### POST /api/payment/withdraw
Initiate withdrawal (requires auth).
```json
{
  "amount": 1000,
  "payment_method": "MPESA"
}
```

### GET /api/payment/history
Get transaction history (requires auth).

---

## Admin Endpoints

### GET /api/admin/stats
Get system statistics (requires admin).

### GET /api/admin/users
Get users list (requires admin).

### GET /api/admin/transactions
Get all transactions (requires admin).

### GET /api/admin/rooms
Get room statistics (requires admin).

### GET /api/admin/fraud-flags
Get fraud flags (requires admin).

### POST /api/admin/fraud-flags/:id/resolve
Resolve fraud flag (requires admin).

---

## WebSocket Events

### join_room
Join a game room for real-time updates.
```json
{ "room_id": "uuid" }
```

### leave_room
Leave a game room.

### watch_match
Watch a specific match.
```json
{ "match_id": "uuid" }
```

### toss_maize
Toss the maize (roller only).
```json
{ "match_id": "uuid" }
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message"
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `429`: Too Many Requests
- `500`: Server Error

---

## Rate Limiting

- **Login**: 5 attempts per 15 minutes
- **API General**: 100 requests per minute
- **Strict (Payments)**: 20 requests per 10 minutes

---

## Authentication

All protected endpoints require:
- JWT token in `Authorization: Bearer <token>` header, OR
- Token in `token` cookie

Tokens expire after 30 minutes by default.
