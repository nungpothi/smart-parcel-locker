# Smart Parcel Locker Backend (Phase 1)

Foundational Go backend using Fiber and GORM following a clean architecture layout with real PostgreSQL integration (auto-migrations) and a working CRUD template module.

## Stack
- Go 1.22
- Fiber (HTTP)
- GORM with PostgreSQL driver
- Environment-based configuration loader

## Structure
- `cmd/server` – application entrypoint
- `domain` – entities and repository interfaces
- `usecase` – application use cases
- `adapter` – inbound/outbound adapters (HTTP handlers live here)
- `infrastructure` – framework integrations (DB, HTTP, logging, etc.)
- `pkg` - shared utilities (config, error/response templates)
- `adapter/template`, `domain/template`, `usecase/template`, `infrastructure/template` - reusable module template (real CRUD)

## Getting Started
1. Copy `.env.example` to `.env` and adjust values.
2. Install dependencies and tidy modules:
   ```bash
   cd backend
   go mod tidy
   ```
3. Run the server (ensure PostgreSQL is reachable):
   ```bash
   go run ./cmd/server
   ```

## API (v1) - Auth
- `POST /api/v1/auth/register` - create user (hashes password, unique phone)
- `POST /api/v1/auth/login` - login with phone/password, returns `access_token`
- `GET /api/v1/auth/me` - current user (Bearer token)
- `POST /api/v1/auth/logout` - revoke token (best effort)

## API (v1) - Parcel Workflow
- `POST /api/v1/parcels/create` - create parcel (CREATED)
- `POST /api/v1/parcels/reserve` - reserve compartment (RESERVED)
- `POST /api/v1/parcels/deposit` - store parcel (STORED)
- `POST /api/v1/parcels/ready` - mark pickup-ready (PICKUP_READY)
- `POST /api/v1/parcels/otp/request` – generate OTP (ACTIVE)
- `POST /api/v1/parcels/otp/verify` – verify OTP (VERIFIED/EXPIRED)
- `POST /api/v1/parcels/pickup` - pickup parcel (PICKED_UP, compartment released)
- `POST /api/v1/parcels/expire/run` - expire ready parcels (EXPIRED, compartment released)

## API (v1) - Admin Operations
- `POST /api/v1/admin/locations` - create location
- `GET /api/v1/admin/locations` - list locations
- `POST /api/v1/admin/lockers` - register locker
- `GET /api/v1/admin/lockers` - list lockers
- `PATCH /api/v1/admin/lockers/{locker_id}/status` - update locker status
- `POST /api/v1/admin/lockers/{locker_id}/compartments` - bulk create compartments
- `GET /api/v1/admin/lockers/{locker_id}/compartments` - list compartments
- `GET /api/v1/admin/overview` - system overview counts

## Notes
- PostgreSQL tables for lockers, slots, parcels, admins, and templates are auto-migrated on startup (UUID primary keys).
- Template module illustrates the standard for new modules: real CRUD (entity, repository, transaction-aware use case, HTTP handlers/routes at `/api/v1/templates`, and a minimal unit test).
- Locker/Parcel/Admin modules are scaffolded with real repositories and endpoints; parcel flow now includes compartment reservation, deposit, pickup, OTP verification, and expiration.
- Keep requirements documents at the repository root in sync with code changes.
