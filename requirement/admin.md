# Admin Module Requirements

Scope:
- Minimal admin entity with CRUD (UUID primary key, username unique, password_hash, role).
- Repository interface and GORM implementation (stubbed logic).
- Use case CRUD signatures following the template.
- HTTP CRUD endpoints (versioned) without real authentication (stub).

Constraints:
- No advanced authorization; keep handlers thin.
- Business logic should reside in domain receivers when introduced.
- Use typed errors; map to HTTP in adapters.
