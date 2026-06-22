# Postman Testing Guide — Bus Ticketing API

Base URL: `http://localhost:4000/api/v1`

## Setup

1. Start server: `npm run dev`
2. In Postman, create an environment variable:
   - `baseUrl` = `http://localhost:4000/api/v1`
   - `token` = (set after login)
   - `bookingId` = (set after booking)
   - `paymentId` = (set after payment initiate)

3. For all protected routes, add header:
   ```
   Authorization: Bearer {{token}}
   ```

## Test accounts (from seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@busapp.com | Admin@123 |
| User | yash@busapp.com | Password@123 |
| User | priya@busapp.com | Password@123 |

---

## 1. Auth

### Register
```
POST {{baseUrl}}/auth/register
Content-Type: application/json
```
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "Password@123",
  "phone": "9000000001",
  "referralCode": "YASH1001"
}
```

### Login
```
POST {{baseUrl}}/auth/login
```
```json
{
  "email": "yash@busapp.com",
  "password": "Password@123"
}
```
Save `data.tokens.accessToken` → `{{token}}`

### Refresh token
```
POST {{baseUrl}}/auth/refresh
```
```json
{
  "refreshToken": "<paste refreshToken from login>"
}
```

### Logout
```
POST {{baseUrl}}/auth/logout
Authorization: Bearer {{token}}
```

### Quick auth check (token only)
```
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}
```

---

## 2. User profile

### Full profile
```
GET {{baseUrl}}/users/me
Authorization: Bearer {{token}}
```

### Update profile
```
PATCH {{baseUrl}}/users/me
Authorization: Bearer {{token}}
```
```json
{
  "name": "Yash Chawan Updated",
  "phone": "9876543210"
}
```

### Change password
```
PATCH {{baseUrl}}/users/me/password
Authorization: Bearer {{token}}
```
```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@123"
}
```

---

## 3. Loyalty

### Balance summary
```
GET {{baseUrl}}/loyalty/summary
Authorization: Bearer {{token}}
```

### History
```
GET {{baseUrl}}/loyalty/history
Authorization: Bearer {{token}}
```

---

## 4. Coupons

### Validate coupon (before booking)
```
GET {{baseUrl}}/coupons/validate/WELCOME10?baseAmount=900
Authorization: Bearer {{token}}
```
Seeded codes: `WELCOME10` (10% off), `FLAT100` (₹100 off), `MONSOON20` (20% off)

### Admin — list coupons
```
GET {{baseUrl}}/coupons
Authorization: Bearer <admin-token>
```

### Admin — create coupon
```
POST {{baseUrl}}/coupons
Authorization: Bearer <admin-token>
```
```json
{
  "code": "NEW50",
  "type": "FIXED",
  "value": 50,
  "maxUsesPerUser": 1,
  "maxGlobalUses": 100,
  "isActive": true
}
```

### Admin — update coupon
```
PATCH {{baseUrl}}/coupons/1
Authorization: Bearer <admin-token>
```
```json
{ "isActive": false }
```

### Admin — delete coupon
```
DELETE {{baseUrl}}/coupons/1
Authorization: Bearer <admin-token>
```

---

## 5. Search & seats

### Search schedules
```
GET {{baseUrl}}/search?fromCityId=1&toCityId=2&date=2026-06-21
Authorization: Bearer {{token}}
```
City IDs: 1=Mumbai, 2=Pune, 3=Nashik

### Get seats for a schedule
```
GET {{baseUrl}}/seats/schedule/4
Authorization: Bearer {{token}}
```
Available seats are in `data.seats[]` where `status` = `"AVAILABLE"`

---

## 6. Booking flow (full end-to-end)

### Create booking (with optional coupon + credits)
```
POST {{baseUrl}}/bookings
Authorization: Bearer {{token}}
```
```json
{
  "scheduleId": 4,
  "seatNumbers": ["3A", "3B"],
  "boardingPoint": "Mumbai Central",
  "droppingPoint": "Pune Station",
  "couponCode": "FLAT100",
  "creditsToRedeem": 0
}
```
Save `data.id` → `{{bookingId}}`

### Get booking
```
GET {{baseUrl}}/bookings/{{bookingId}}
Authorization: Bearer {{token}}
```

### My bookings
```
GET {{baseUrl}}/bookings/my-bookings
Authorization: Bearer {{token}}
```

---

## 7. Payment flow

### Initiate payment
```
POST {{baseUrl}}/payments/initiate/{{bookingId}}
Authorization: Bearer {{token}}
```
Save `data.id` → `{{paymentId}}`

### Confirm payment (mock)
```
PATCH {{baseUrl}}/payments/confirm/{{paymentId}}
Authorization: Bearer {{token}}
```
After confirm: booking `paymentStatus` = `SUCCESS`, loyalty credits earned (7.5% of base amount)

### Get payment by booking
```
GET {{baseUrl}}/payments/booking/{{bookingId}}
Authorization: Bearer {{token}}
```

---

## 8. Cancel & refund

```
PATCH {{baseUrl}}/bookings/{{bookingId}}/cancel
Authorization: Bearer {{token}}
```
**Use PATCH, not GET.**

Expected after paid booking:
- booking `status` = `CANCELLED`
- booking `paymentStatus` = `REFUNDED`
- payment `status` = `REFUNDED`, `refundedAt` set
- redeemed credits restored; earned credits reversed

---

## 9. Admin APIs

Login as admin first, use admin token.

### List all bookings
```
GET {{baseUrl}}/admin/bookings?page=1&limit=20
Authorization: Bearer <admin-token>
```
Optional filters: `status`, `paymentStatus`, `userId`, `fromDate`, `toDate`

### Get any booking
```
GET {{baseUrl}}/admin/bookings/{{bookingId}}
Authorization: Bearer <admin-token>
```

### Reports summary
```
GET {{baseUrl}}/admin/reports/summary?fromDate=2026-06-01&toDate=2026-06-30
Authorization: Bearer <admin-token>
```

### View logs
```
GET {{baseUrl}}/admin/logs?lines=50
Authorization: Bearer <admin-token>
```

---

## 10. Inventory APIs (admin CRUD)

All modification endpoints require **ADMIN** role.

### Cities
```
GET    {{baseUrl}}/cities
POST   {{baseUrl}}/cities          (admin)
PATCH  {{baseUrl}}/cities/:id       (admin)
DELETE {{baseUrl}}/cities/:id       (admin)
```

### Buses
```
GET    {{baseUrl}}/buses
POST   {{baseUrl}}/buses            (admin)
PATCH  {{baseUrl}}/buses/:id        (admin)
DELETE {{baseUrl}}/buses/:id        (admin)
```

### Routes
```
GET    {{baseUrl}}/routes
POST   {{baseUrl}}/routes           (admin)
PATCH  {{baseUrl}}/routes/:id       (admin)
DELETE {{baseUrl}}/routes/:id       (admin)
```

### Schedules
```
GET    {{baseUrl}}/schedules
POST   {{baseUrl}}/schedules        (admin)
PATCH  {{baseUrl}}/schedules/:id    (admin)
DELETE {{baseUrl}}/schedules/:id    (admin)
```

---

## Recommended test order

1. Login as `yash@busapp.com` → save token
2. `GET /users/me` and `GET /loyalty/summary`
3. `GET /search` → pick a schedule with available seats
4. `GET /seats/schedule/:id` → pick seat numbers
5. `GET /coupons/validate/FLAT100?baseAmount=900` → preview discount
6. `POST /bookings` with coupon
7. `POST /payments/initiate/:bookingId`
8. `PATCH /payments/confirm/:paymentId`
9. `GET /loyalty/summary` → credits should increase
10. `PATCH /bookings/:id/cancel` → verify refund
11. Login as admin → `GET /admin/bookings`, `GET /admin/reports/summary`

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Cancel returns 404 | Use `PATCH`, not `GET` |
| Booking seats not found | Use `data.seats` array from seats API |
| Coupon already used | Use a different user or coupon code |
| 403 on admin routes | Login as `admin@busapp.com` |
| Seats unavailable | Pick a different schedule or seat numbers |

---

## What's NOT in this backend yet

- Redis caching (planned)
- Real payment gateway (currently MOCK)
- Admin dashboard UI
- Flutter mobile app
- Automated test suite
- Deployment / Nginx reverse proxy

These are the next phases after the REST API is complete.
