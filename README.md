# TealTransit — Bus Ticketing & Fleet Management Platform

**TealTransit** is a full-stack **online bus ticketing system** for passengers, operators, and administrators. Search routes, pick seats, book tickets, and manage fleets from a **Flutter mobile app**, **React admin dashboard**, and **Express REST API** backedb by **MySQL** and **Prisma**.

> Keywords: bus booking app · bus ticket reservation · seat selection · fleet management · operator dashboard · intercity bus transport · Flutter · Node.js · Prisma · MySQL

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Demo accounts](#demo-accounts)
- [Mobile development notes](#mobile-development-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This monorepo powers an end-to-end **bus ticketing platform**:


| App                          | Audience          | Purpose                                                                       |
| ---------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| **Mobile** (`mobile/`)       | Passengers        | Search cities, view schedules, select seats, apply coupons, pay, manage trips |
| **Dashboard** (`dashboard/`) | Admin & operators | Manage buses, routes, schedules, bus stops, bookings, coupons, and audit logs |
| **API** (`src/`)             | All clients       | Authentication, search, bookings, payments, loyalty, and admin operations     |


The backend exposes a versioned REST API at `/api/v1` with JWT auth, role-based access (USER, ADMIN, OPERATOR), rate limiting, and structured audit logging.

---

## Features

### Passenger (Flutter app)

- City search with live autocomplete and recent searches
- Schedule search results with filter and sort
- Interactive seat map and booking flow
- Boarding / dropping bus stop selection
- Coupon codes and loyalty point redemption
- Transparent fare breakdown including GST
- My Trips, ticket details, profile, and change password
- Loyalty balance history

### Admin & operator (React dashboard)

- Fleet overview, buses, and schedules
- Seat layout visualization
- Booking management
- Cities, routes, and **bus stops** (pickup/drop points)
- Coupon management (admin)
- Operator management and audit logs (admin)

### Backend

- User registration, login, refresh tokens
- Route & schedule management with seat generation
- Booking holds, payments, cancellations
- Coupons, loyalty credits, and referrals
- Bus stop CRUD per city
- Configurable GST rate and rate limits

---

## Architecture

```mermaid
flowchart LR
  subgraph clients [Clients]
    Mobile[Flutter Mobile App]
    Dashboard[React Dashboard]
  end

  subgraph backend [Backend]
    API[Express API /api/v1]
    Prisma[Prisma ORM]
  end

  subgraph data [Data]
    MySQL[(MySQL)]
    Redis[(Redis)]
  end

  Mobile --> API
  Dashboard --> API
  API --> Prisma
  Prisma --> MySQL
  API --> Redis
```



---

## Tech stack


| Layer         | Technologies                                             |
| ------------- | -------------------------------------------------------- |
| **Mobile**    | Flutter 3.x, Dart, Riverpod, GoRouter, Dio, Freezed      |
| **Dashboard** | React 19, TypeScript, Vite, TanStack Query, Tailwind CSS |
| **API**       | Node.js, Express 5, TypeScript, Joi validation           |
| **Database**  | MySQL, Prisma ORM                                        |
| **Auth**      | JWT (access + refresh), bcrypt                           |
| **Infra**     | Redis, Winston logging, Helmet, CORS, express-rate-limit |


---

## Project structure

```
bus-ticketing-system/
├── src/                 # Express API (feature-based modules)
├── prisma/              # Schema, migrations, seed data
├── dashboard/           # React admin / operator dashboard
├── mobile/              # Flutter passenger app (TealTransit)
├── .env                 # Backend secrets (not committed)
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ and npm
- **MySQL** 8+
- **Redis** (optional but recommended)
- **Flutter SDK** 3.12+ (for mobile)
- **Android Studio / Xcode** (for device emulators)

---

## Quick start

### 1. Clone and install API dependencies

```bash
git clone <your-repo-url>
cd bus-ticketing-system
npm install
```

### 2. Configure environment

Create a `.env` file in the project root (see [Environment variables](#environment-variables)).

### 3. Database setup

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

### 4. Start the API

```bash
npm run dev
```

`predev` syncs your LAN IP into `.env`, `dashboard/.env`, and the mobile dev config.

API runs at `http://localhost:4000` · Health check: `GET /health`

### 5. Start the dashboard

```bash
cd dashboard
npm install
npm run dev
```

`predev` automatically runs `npm run sync-ip` so `VITE_API_BASE_URL` matches your current LAN IP. If your IP changes during a session, run `npm run watch-ip` from the repo root in another terminal.

Open the URL shown in the terminal (typically `http://localhost:5173`).

### 6. Run the mobile app

```bash
# From repo root — syncs your LAN IP into mobile + dashboard config, then runs the app
npm run dev:mobile
```

Or manually:

```bash
npm run sync-ip
cd mobile
flutter run
```

The sync script writes your current Wi-Fi IP into `mobile/lib/config/dev_api_config.g.dart`. After your IP changes, run `npm run sync-ip` again and **hot-restart** the app (or re-run `flutter run`).

To keep IP updated while you work:

```bash
npm run watch-ip
```

---

## Environment variables

Copy these into `.env` at the repo root and adjust for your environment:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/busManagementSystem"
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
REDIS_URL=redis://localhost:6379
PORT=4000

REFERRAL_BONUS_CREDITS=300
LOYALTY_EARN_RATE=0.075
LOYALTY_POINT_VALUE=0.1
PLATFORM_COMMISSION_RATE=0.05
GST_RATE=0.18

RATE_LIMIT_ENABLED=true
RATE_LIMIT_STRICT_WINDOW_MS=900000
RATE_LIMIT_STRICT_MAX=10
RATE_LIMIT_MODERATE_WINDOW_MS=60000
RATE_LIMIT_MODERATE_MAX=950
TRUST_PROXY=false
```

Never commit real credentials. `.env` is gitignored.

---

## API overview

Base URL: `/api/v1`


| Module    | Path prefix  | Description                      |
| --------- | ------------ | -------------------------------- |
| Auth      | `/auth`      | Register, login, refresh, logout |
| Cities    | `/cities`    | City list and search             |
| Bus stops | `/bus-stops` | Pickup/drop points per city      |
| Routes    | `/routes`    | Inter-city routes                |
| Schedules | `/schedules` | Departures and seat maps         |
| Search    | `/search`    | Passenger schedule search        |
| Bookings  | `/bookings`  | Create, list, cancel bookings    |
| Payments  | `/payments`  | Payment initiate and confirm     |
| Coupons   | `/coupons`   | Validate and manage coupons      |
| Loyalty   | `/loyalty`   | Points summary and history       |
| Users     | `/users`     | Profile and password             |
| Admin     | `/admin`     | Audit logs, reports              |
| Config    | `/config`    | Public app configuration         |


---

## Demo accounts

After running `npx prisma db seed`:


| Role     | Email                 | Password       |
| -------- | --------------------- | -------------- |
| Admin    | `admin@busapp.com`    | `Admin@123`    |
| Operator | `operator@busapp.com` | `Admin@123`    |
| User     | `yash@busapp.com`     | `Password@123` |
| User     | `priya@busapp.com`    | `Password@123` |


---

## Mobile development notes

### Physical Android device (Xiaomi / MIUI)

If install fails with `INSTALL_FAILED_USER_RESTRICTED`:

1. Enable **Developer options** → **USB debugging**
2. Enable **Install via USB** (MIUI security setting)
3. Reconnect the device and approve the install prompt on the phone

### API URL on device

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.x.x:4000/api/v1
```

Ensure the phone and PC are on the same network and the API binds to `0.0.0.0` or your LAN IP.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit with clear messages
4. Open a pull request describing changes and test steps

Keep changes scoped per feature. Run `flutter analyze` for mobile and `npm run build` for API/dashboard before submitting.

---

## License

ISC — see [package.json](./package.json).

---

**TealTransit** · Open-source bus ticketing system · Flutter + React + Express + Prisma + MySQL