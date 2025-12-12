# Phase 1 – Working Foundation (Real DB + APIs)

Scope: runnable Go backend using Fiber + GORM + PostgreSQL with clean architecture, auto-migrated schema, and a working CRUD template module.

What exists:
- Bootstrap under `/backend` with env-driven config and PostgreSQL connection (pgcrypto extension enabled).
- AutoMigrate on startup for tables: `lockers`, `slots`, `parcels`, `admins`, `templates` (UUID primary keys, relations).
- Transaction helper using GORM transactions for write flows.
- Template module: CRUD entity, repository (GORM), transaction-aware use case, and HTTP CRUD API at `/api/v1/templates`.
- Locker module scaffolding: domain service for validation/slot selection, repo with GORM, deposit/retrieve use cases and HTTP endpoints at `/api/v1/lockers/deposit` and `/api/v1/lockers/retrieve` (logic minimal).
- Parcel module: entity with status, repo and use case, minimal HTTP endpoints at `/api/v1/parcels`.
- Admin module: entity and CRUD repo/use case, HTTP endpoints at `/api/v1/admins`.
- Standard API response and typed errors under `pkg/response` and `pkg/errorx`.

Out of scope: advanced business rules, authentication, production hardening.
