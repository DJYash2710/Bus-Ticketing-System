# Bus Ticketing API Docs

This document covers the implemented backend APIs for the bus ticket booking system built with Express, Prisma, and MySQL. The current implemented modules are Auth, Buses, Cities, Routes, Schedules, and Seats. The APIs follow a modular REST style that fits Prisma + Express service/controller routing patterns.[cite:267][cite:244]

## Base setup

Base URL in local development:

```text
http://localhost:4000/api/v1
```

Common requirements:

- Most endpoints require `Authorization: Bearer <accessToken>`.
- Admin-only endpoints require a user with `role = ADMIN`.
- Request and response bodies are JSON.
- Validation errors return 400 responses.
- Protected endpoints return 401 for missing/invalid tokens and 403 for insufficient role access.

## Auth APIs

These endpoints handle registration, login, token-based identity checks, and authenticated user access. They are the first APIs that should be tested because the rest of the modules depend on valid access tokens.

### `POST /auth/register`

Registers a new user.

Request body:

```json
{
  "name": "Yash Chawan",
  "email": "yash@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

Expected behavior:

- Creates a new user account.
- Returns the created user and auth tokens if your current auth implementation is set up that way.
- Fails if email or phone already exists.

### `POST /auth/login`

Logs in an existing user.

Request body:

```json
{
  "email": "yash@example.com",
  "password": "password123"
}
```

Typical response shape:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Yash Chawan",
      "email": "yash@example.com",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### `GET /auth/me`

Returns the currently authenticated user.

Headers:

```http
Authorization: Bearer <accessToken>
```

Use this after login to verify the token is valid.

## Bus APIs

Bus APIs manage bus inventory and are protected so that create, update, and delete operations are admin-only. This separation fits common Express + Prisma CRUD patterns for business resources.[cite:267][cite:244]

### `GET /buses`

Returns all buses.

Headers:

```http
Authorization: Bearer <accessToken>
```

### `GET /buses/:id`

Returns one bus by ID.

### `POST /buses`

Creates a bus. Admin only.

Request body:

```json
{
  "registrationNo": "MH01-AB-1234",
  "name": "Mumbai Express",
  "capacity": 40,
  "type": "SEATER",
  "amenities": ["AC", "WiFi"]
}
```

### `PATCH /buses/:id`

Updates a bus. Admin only.

Request body example:

```json
{
  "name": "Mumbai Super Express",
  "capacity": 45
}
```

### `DELETE /buses/:id`

Deletes a bus. Admin only.

## City APIs

Cities are used as source and destination anchors for routes and search. Keeping cities as a separate resource makes route and search logic cleaner in transport systems.[cite:245][cite:247]

### `GET /cities`

Returns all cities.

Optional query:

```text
/cities?search=Mum
```

### `GET /cities/:id`

Returns one city by ID.

### `POST /cities`

Creates a city. Admin only.

Request body:

```json
{
  "name": "Mumbai",
  "state": "Maharashtra",
  "country": "India"
}
```

### `PATCH /cities/:id`

Updates a city. Admin only.

### `DELETE /cities/:id`

Deletes a city. Admin only.

## Route APIs

Routes connect source and destination cities and are the backbone for schedule creation and search. A route typically stores city links plus distance and duration metadata.[cite:245][cite:247]

### `GET /routes`

Returns all routes.

Optional filters:

```text
/routes?fromCityId=1&toCityId=2
```

### `GET /routes/:id`

Returns one route by ID.

### `POST /routes`

Creates a route. Admin only.

Request body:

```json
{
  "code": "MUM-PUN-01",
  "fromCityId": 1,
  "toCityId": 2,
  "distanceKm": 150,
  "durationMin": 180
}
```

### `PATCH /routes/:id`

Updates route metadata. Admin only.

Request body example:

```json
{
  "distanceKm": 155,
  "durationMin": 190
}
```

### `DELETE /routes/:id`

Deletes a route. Admin only.

## Schedule APIs

Schedules represent actual trips for a bus on a route at a specific date and time. Schedule endpoints are central to trip discovery and later booking flow.[cite:266][cite:272]

### `GET /schedules`

Returns schedules.

Optional filters:

```text
/schedules?routeId=1
/schedules?busId=1
/schedules?status=ACTIVE
/schedules?date=2026-06-20
```

### `GET /schedules/:id`

Returns one schedule with route, bus, seats, and booking-related context depending on the implementation.

### `POST /schedules`

Creates a schedule. Admin only.

Request body:

```json
{
  "routeId": 1,
  "busId": 1,
  "departureTime": "2026-06-20T06:00:00.000Z",
  "arrivalTime": "2026-06-20T09:00:00.000Z",
  "basePrice": 399
}
```

Expected behavior:

- Creates the schedule.
- Auto-generates seats based on bus capacity in the current implementation.

### `PATCH /schedules/:id`

Updates a schedule. Admin only.

Request body example:

```json
{
  "basePrice": 449,
  "status": "ACTIVE"
}
```

### `DELETE /schedules/:id`

Deletes a schedule if no bookings exist. Admin only.

## Seat APIs

Seat APIs expose seat availability for a schedule and allow controlled admin overrides. This is the backend foundation for seat-map rendering and later booking selection flows.[cite:276][cite:282]

### `GET /seats/schedule/:scheduleId`

Returns all seats for a schedule, plus schedule metadata and seat summary.

Optional filter:

```text
/seats/schedule/1?status=AVAILABLE
```

Typical response includes:

- `schedule`
- `summary.total`
- `summary.available`
- `summary.held`
- `summary.booked`
- ordered `seats[]`

### `GET /seats/:id`

Returns a single seat by ID, including related schedule and booking linkage if present.

### `PATCH /seats/:id/status`

Updates seat status manually. Admin only.

Request body:

```json
{
  "status": "HELD"
}
```

Allowed values:

- `AVAILABLE`
- `HELD`
- `BOOKED`

## Testing flow

A simple order to test the current backend:

1. Register or login.
2. Call `/auth/me` with the access token.
3. If using admin APIs, make sure the user role is `ADMIN`.
4. Test `/cities`, `/routes`, and `/buses`.
5. Test `/schedules` creation and listing.
6. Test `/seats/schedule/:scheduleId` for a created or seeded schedule.

## Example local workflow

### 1. Login

```http
POST /api/v1/auth/login
```

```json
{
  "email": "admin@busapp.com",
  "password": "Admin@123"
}
```

### 2. Use token

```http
Authorization: Bearer <accessToken>
```

### 3. Create city

```http
POST /api/v1/cities
```

```json
{
  "name": "Kolhapur",
  "state": "Maharashtra",
  "country": "India"
}
```

### 4. Create route

```http
POST /api/v1/routes
```

```json
{
  "code": "PUN-KOL-01",
  "fromCityId": 2,
  "toCityId": 9,
  "distanceKm": 230,
  "durationMin": 300
}
```

### 5. Create schedule

```http
POST /api/v1/schedules
```

```json
{
  "routeId": 7,
  "busId": 1,
  "departureTime": "2026-06-21T08:00:00.000Z",
  "arrivalTime": "2026-06-21T13:00:00.000Z",
  "basePrice": 499
}
```

### 6. Fetch seats

```http
GET /api/v1/seats/schedule/13
```

## Current implemented modules vs pending modules

Implemented:

- Auth APIs
- Bus APIs
- City APIs
- Route APIs
- Schedule APIs
- Seat APIs

Planned next:

- Search API
- Booking API
- Payment API
- Admin Dashboard
- Flutter App
- Testing
- Deployment

## Notes for future extensions

The current seat API is intentionally simple. It can later be expanded into the richer seat-layout structure planned for the mobile app, including front/back indicators, washroom and exit cells, lower and upper decks, best-seller highlights, and seat price display below the seat.[cite:276][cite:282]
