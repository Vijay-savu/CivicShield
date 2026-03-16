# CivicShield

CivicShield is a full-stack cybersecurity prototype for secure e-governance workflows. It demonstrates zero-trust JWT access control, role-based authorization, tamper-evident citizen records, and monitoring logs.

## Project Structure

```text
backend/
frontend/
```

## Features

- JWT login for `citizen` and `admin`
- Password hashing with bcrypt
- Zero-trust middleware on protected APIs
- MongoDB record storage with SHA-256 integrity hashes
- Monitoring logs for login attempts, record creation, record modification, and tampering alerts
- Admin-only tamper simulation route for the demo scenario
- React dashboard with record creation, record viewer, integrity badges, and alerts

## Backend Setup

1. Copy `backend/.env.example` to `backend/.env`
2. Update `MONGODB_URI` and `JWT_SECRET`
3. Run `npm install`
4. Run `npm run dev`

Demo users are seeded automatically on startup:

- `citizen@civicshield.local` / `Citizen@123`
- `admin@civicshield.local` / `Admin@123`

## Frontend Setup

1. Copy `frontend/.env.example` to `frontend/.env`
2. Run `npm install`
3. Run `npm run dev`

The Vite dev server proxies `/api` requests to `http://localhost:5000`.

## Demo Flow

1. Log in as the citizen user
2. Create a government record
3. Log out and log in as the admin user
4. Open the record and use the tamper simulation action
5. Refresh the dashboard to see the integrity alert and monitoring logs
