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

## Notes
- PostgreSQL tables for lockers, slots, parcels, admins, and templates are auto-migrated on startup (UUID primary keys).
- Template module illustrates the standard for new modules: real CRUD (entity, repository, transaction-aware use case, HTTP handlers/routes at `/api/v1/templates`, and a minimal unit test).
- Locker/Parcel/Admin modules are scaffolded with real repositories and endpoints but minimal domain rules; extend their receivers/use cases in later phases.
- Keep requirements documents at the repository root in sync with code changes.
