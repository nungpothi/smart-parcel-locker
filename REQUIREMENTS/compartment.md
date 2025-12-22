# Compartment Requirements

## Admin Create (Batch)

### Endpoint
`POST /api/v1/admin/lockers/{locker_id}/compartments`

### Request Body
- `compartments` (array, required)
  - `compartment_no` (integer, required)
  - `size` (string, required) - `S | M | L`
  - `overdue_fee_per_day` (integer, optional) - defaults to `0`

### Validation Rules
- `compartment_no` must be greater than 0.
- `size` must be one of `S`, `M`, `L`.
- `overdue_fee_per_day` must be greater than or equal to 0.

### Behavior
- `overdue_fee_per_day` is stored per compartment.
- This value represents the per-day overdue fee to be applied during pickup.
