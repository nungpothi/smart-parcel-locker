# Parcel Module Requirements

Domain:
- Parcel entity with status field, UUID primary key, locker_id/slot_id foreign keys.
- Repository interface and GORM implementation (stubbed logic).

Use cases:
- Create parcel.
- Retrieve parcel by ID.

API:
- Exposed only as needed to support locker flows (internal wiring).

Constraints:
- No complex status workflows; keep logic minimal and receiver-driven when added.
- Use typed errors; handlers map to HTTP responses.
