# Template Module Requirements

Scope:
- Real CRUD template module backed by PostgreSQL using UUID primary keys.

API (under `/api/v1/templates`):
- `GET /api/v1/templates` list templates.
- `POST /api/v1/templates` create template (name, description).
- `GET /api/v1/templates/{id}` retrieve by ID.
- `PUT /api/v1/templates/{id}` update.
- `DELETE /api/v1/templates/{id}` delete.

Data:
- Table `templates` with columns: id (UUID PK), name (string, required), description (string), timestamps.

Architecture:
- Domain entity in `domain/template`.
- Repository interface + GORM implementation.
- Use case with transaction handling for writes.
- HTTP handler/route registration in adapter layer.

Constraints:
- Business logic belongs to domain receivers (none yet).
- Use cases manage transactions; handlers stay thin and map errors to HTTP responses.
