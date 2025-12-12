# Phase 1 - Foundation & Templates

Scope: backend clean architecture skeleton in Go using Fiber and GORM. No business rules or real routes beyond placeholders.

What exists:
- Project bootstrap under `/backend` with Go module, environment example, and gitignore.
- Configuration loader reads env variables into structured config (app, HTTP, database).
- Infrastructure wiring for Fiber app creation and PostgreSQL GORM initialization; transaction helper placeholder.
- Template module to copy for future features: entity, repository interface, GORM repository stub, use case with `Execute`, HTTP handler and router, and a trivial unit test.
- Shared error (`pkg/errorx`) and standard API response (`pkg/response`) templates.

Out of scope: real CRUD, domain rules, SQL, and non-template modules.

