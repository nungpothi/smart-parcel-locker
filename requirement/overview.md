# Phase 1/2 Overview

Scope: backend clean architecture skeleton in Go using Fiber and GORM, plus Phase 2 core modules (locker, parcel, admin) using the template pattern.

What exists:
- Project bootstrap under `/backend` with Go module, environment example, and gitignore.
- Configuration loader reads env variables into structured config (app, HTTP, database).
- Infrastructure wiring for Fiber app creation and PostgreSQL GORM initialization; transaction helper placeholder.
- Template module to copy for future features: entity, CRUD repository interface, GORM repository stubs, use case CRUD signatures, HTTP CRUD handlers and router at `/api/v1/templates`, and a minimal unit test.
- Locker module: domain entities (Locker, Slot), domain service with validation and best-fit selection hooks, typed errors, repository interface + GORM stub, deposit/retrieve use cases with transaction orchestration, HTTP endpoints at `/api/v1/lockers/deposit` and `/api/v1/lockers/retrieve`.
- Parcel module: entity with status, repository interface + GORM stub, create/get use cases, minimal HTTP endpoints.
- Admin module: entity, CRUD repository interface + GORM stub, CRUD use case, HTTP CRUD endpoints at `/api/v1/admins`.
- Shared error (`pkg/errorx`) and standard API response (`pkg/response`) templates.

Out of scope: production-ready logic, real SQL/GORM operations, advanced auth, and full business workflows.
