# Locker Module Requirements

APIs:
- `POST /api/v1/lockers/deposit` to accept a parcel and assign a slot.
- `POST /api/v1/lockers/retrieve` to retrieve a parcel from a slot.

Domain:
- Locker entity with slots; Slot entity. UUID primary keys; Locker fields: code (unique), name, location, timestamps. Slot fields: locker_id, size (1/2/3), occupied, parcel_id, timestamps.
- LockerService domain service handles deposit validation and best-fit slot selection via receiver methods.

Behavior (Phase 2 scope):
- Deposit must validate parcel and locker capacity via domain logic.
- Select best-fit slot within LockerService (receiver-driven).
- Retrieval validates and updates status via domain logic.
- No real persistence logic yet (stubbed repositories).

Use cases:
- DepositParcel orchestrates validation, slot selection, and repository calls.
- RetrieveParcel orchestrates validation and repository calls.

Constraints:
- Keep business rules in domain receivers, not in handlers.
- Use transaction helper for multi-step flows.
- Map typed domain errors to HTTP responses in adapters.
