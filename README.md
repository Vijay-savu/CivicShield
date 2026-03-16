# CivicShield

CivicShield is a full-stack secure government service prototype. It demonstrates zero-trust access checks, REST APIs, tamper-evident ledgers, citizen document verification, degraded-mode availability, and defense-in-depth security.

## Core Architecture

Citizen Portal -> API Gateway -> Auth Service -> Document Service -> Application Service -> Verification Service -> Tax Service -> Ledger Service -> Monitoring / Notifications -> MongoDB

## What Is Implemented

- Zero Trust Architecture:
  - JWT on protected APIs
  - request device binding
  - per-request timestamp validation
  - ownership checks on citizen data
- REST API design:
  - documented in [`openapi.yaml`](./openapi.yaml)
- DDoS / availability controls:
  - API-wide rate limiting
  - per-service rate limiting
  - service isolation
  - circuit breakers
  - degraded-mode gateway availability endpoint
- Tamper-evident integrity:
  - SHA-256 hashes
  - tamper-evident ledger chain
- Defense in depth:
  - security headers
  - authentication
  - authorization
  - input validation
  - logging
  - tamper detection
- Cloud-ready deployment:
  - Dockerfiles for backend and frontend
  - [`docker-compose.yml`](./docker-compose.yml)
  - Nginx reverse proxy for frontend/API routing
- IaC security baseline:
  - Terraform skeleton in [`infra/terraform`](./infra/terraform)
- DevSecOps:
  - GitHub Actions workflow in [`.github/workflows/devsecops.yml`](./.github/workflows/devsecops.yml)

## Project Structure

```text
backend/
frontend/
infra/terraform/
.github/workflows/
openapi.yaml
docker-compose.yml
```

## Backend Setup

1. Copy `backend/.env.example` to `backend/.env`
2. Update `MONGODB_URI` and `JWT_SECRET`
3. Run `npm install`
4. Run `npm run dev`

Demo users are seeded automatically on startup:

- `citizen@civicshield.local` / `Citizen@123`
- `officer@civicshield.local` / `Officer@123`
- `admin@civicshield.local` / `Admin@123`

## Frontend Setup

1. Copy `frontend/.env.example` to `frontend/.env`
2. Run `npm install`
3. Run `npm run dev`

The Vite dev server proxies `/api` requests to `http://localhost:5000`.

## Docker Run

```bash
docker compose up --build
```

## Demo Flow

1. Log in as the citizen user
2. Upload Aadhaar, PAN, and Income Certificate
3. Apply for a scheme
4. Let OCR extract income and verify documents
5. Open the record detail page to show:
   - eligibility decision
   - tamper-evident ledger
   - citizen alert flow
6. Open Tax Service to show circuit breaker and degraded mode
7. Open Security Alerts to show defense-in-depth status
