package parcel

import (
	"time"

	"github.com/google/uuid"
)

type Status string

const (
	StatusPending   Status = "PENDING"
	StatusDeposited Status = "DEPOSITED"
	StatusRetrieved Status = "RETRIEVED"
	StatusExpired   Status = "EXPIRED"
)

// Parcel represents a package stored in a locker compartment.
type Parcel struct {
	ID            uuid.UUID
	ParcelCode    string
	LockerID      uuid.UUID
	CompartmentID *uuid.UUID
	Size          string // S | M | L
	CourierID     uuid.UUID
	RecipientID   uuid.UUID
	Status        Status
	ReservedAt    *time.Time
	DepositedAt   *time.Time
	PickedUpAt    *time.Time
	ExpiresAt     *time.Time
	CreatedAt     time.Time
	UpdatedAt     *time.Time
}

// SetStatus updates the parcel status.
func (p *Parcel) SetStatus(status Status) {
	p.Status = status
}
