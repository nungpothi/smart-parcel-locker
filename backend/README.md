# Smart Parcel Locker Backend (Phase 1)

Foundational Go backend using Fiber and GORM following a clean architecture layout. This phase provides templates and wiring only—no business logic yet.

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
- `pkg` – shared utilities (config, error/response templates)
- `adapter/template`, `domain/template`, `usecase/template`, `infrastructure/template` - reusable module template

## Getting Started
1. Copy `.env.example` to `.env` and adjust values.
2. Install dependencies and tidy modules:
   ```bash
   cd backend
   go mod tidy
   ```
3. Run the server:
   ```bash
   go run ./cmd/server
   ```

## Notes
- Routes are placeholders; add real endpoints in future phases.
- Template module illustrates the standard for new modules: CRUD structure (entity, repository interface + GORM stub, use case CRUD signatures, HTTP handlers/routes at `/api/v1/templates`, and a minimal unit test).
- Keep requirements documents at the repository root in sync with code changes.
