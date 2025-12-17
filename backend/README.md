# Smart Parcel Locker Backend (Cleanup)

Go backend using Fiber and GORM with PostgreSQL auto-migrations. The API has been reduced to admin operations, locker lookup, and parcel read endpoints to support the new phone-based flow.

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

## Getting Started
1. Copy `.env.example` to `.env` and adjust values.
2. Run the server (ensure PostgreSQL is reachable):
   ```bash
   cd backend
   go run ./cmd/server
   ```

## API (v1) - Parcels
- `GET /api/v1/parcels/{parcel_id}` - fetch parcel by id

## API (v1) - Lockers
- `GET /api/v1/lockers/available` - list available lockers

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
- PostgreSQL tables for locations, lockers, compartments, parcels, and admins are auto-migrated on startup (UUID primary keys).
- Phone-based deposit and pickup APIs will be added in a later step.
