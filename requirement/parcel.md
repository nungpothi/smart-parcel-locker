# Parcel Module Requirements

Domain:
- Parcel entity with UUID primary key and fields: locker_id, slot_id, pickup_code (unique), size (int enum), status (PENDING/DEPOSITED/RETRIEVED/EXPIRED), deposited_at, retrieved_at, expired_at, timestamps.
- Repository interface and GORM implementation (stubbed logic).

Use cases:
- Create parcel.
- Retrieve parcel by ID.

API:
- Exposed only as needed to support locker flows (internal wiring).

Constraints:
- No complex status workflows; keep logic minimal and receiver-driven when added.
- Use typed errors; handlers map to HTTP responses.
