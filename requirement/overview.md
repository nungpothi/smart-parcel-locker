# Phase 1 - Foundation & Templates

Scope: backend clean architecture skeleton in Go using Fiber and GORM. No business rules or real routes beyond placeholders.

What exists:
- Project bootstrap under `/backend` with Go module, environment example, and gitignore.
- Configuration loader reads env variables into structured config (app, HTTP, database).
- Infrastructure wiring for Fiber app creation and PostgreSQL GORM initialization; transaction helper placeholder.
- Template module to copy for future features: entity, CRUD repository interface, GORM repository stubs, use case CRUD signatures, HTTP CRUD handlers and router at `/api/v1/templates`, and a minimal unit test.
- Shared error (`pkg/errorx`) and standard API response (`pkg/response`) templates.

Out of scope: real CRUD, domain rules, SQL, and non-template modules.
