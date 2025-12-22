# Parcel Requirements

## Deposit (Phone-Based)

### Endpoint
`POST /api/v1/parcels/deposit`

### Request Body
- `locker_id` (uuid, required)
- `size` (string, required) — `S | M | L`
- `receiver_phone` (string, required)
- `sender_phone` (string, required)

### Validation Rules
- `receiver_phone` and `sender_phone` must be non-empty and numeric only.
- `size` must be one of `S`, `M`, `L`.

### Success Response
- `parcel_id` (uuid)
- `parcel_code` (string)
- `pickup_code` (string, optional)
- `status` = `READY_FOR_PICKUP`

### Errors
- `400 INVALID_REQUEST`: missing fields, invalid size, invalid phone format
- `404 NOT_FOUND`: locker not found
- `409 CONFLICT`: locker inactive or no available compartment
- `500 INTERNAL_ERROR`: unexpected error

### Business Rules
- No user accounts are involved.
- One request creates one parcel.
- Parcel status after deposit is `READY_FOR_PICKUP`.
- The system allocates an AVAILABLE compartment using Best-fit:
  - Requested `S` can use `S`, `M`, `L` (prefer `S`).
  - Requested `M` can use `M`, `L` (prefer `M`).
  - Requested `L` can use `L` only.
- The selected compartment is reserved (status `RESERVED`) and then marked `OCCUPIED` within the same transaction before commit.
- Selection is concurrency-safe: deposits lock the chosen row and skip locked rows to prevent two requests from getting the same compartment.
- A `parcel_event` is created with `event_type = READY_FOR_PICKUP`.
