package parcel

import (
	"time"

	"github.com/google/uuid"
)

type Status string

const (
	StatusPickedUp  Status = "PICKED_UP"
	StatusCancelled Status = "CANCELLED"
	StatusExpired   Status = "EXPIRED"
)

// Parcel represents a package stored in a locker compartment.
type Parcel struct {
	ID            uuid.UUID
	ParcelCode    string
	LockerID      uuid.UUID
	CompartmentID *uuid.UUID
	Size          string // S | M | L
	ReceiverPhone string
	SenderPhone   string
	PickupCode    *string
	Status        Status
	DepositedAt   *time.Time
	PickedUpAt    *time.Time
	ExpiresAt     *time.Time
	CreatedAt     time.Time
	UpdatedAt     *time.Time
}
