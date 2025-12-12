package parcel

import (
	"time"

	"github.com/google/uuid"
)

type Status string

const (
	StatusCreated     Status = "CREATED"
	StatusReserved    Status = "RESERVED"
	StatusStored      Status = "STORED"
	StatusPickupReady Status = "PICKUP_READY"
	StatusPickedUp    Status = "PICKED_UP"
	StatusCancelled   Status = "CANCELLED"
	StatusExpired     Status = "EXPIRED"
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

// Reserve assigns a compartment and moves to RESERVED.
func (p *Parcel) Reserve(compartmentID uuid.UUID, now time.Time) error {
	if p.Status != StatusCreated {
		return ErrInvalidStatusTransition
	}
	p.CompartmentID = &compartmentID
	p.ReservedAt = &now
	p.Status = StatusReserved
	return nil
}

// Store marks parcel as stored after deposit.
func (p *Parcel) Store(now time.Time) error {
	if p.Status != StatusReserved {
		return ErrInvalidStatusTransition
	}
	p.DepositedAt = &now
	p.Status = StatusStored
	return nil
}

// Ready marks parcel as pickup ready.
func (p *Parcel) Ready() error {
	if p.Status != StatusStored {
		return ErrInvalidStatusTransition
	}
	p.Status = StatusPickupReady
	return nil
}

// Pickup marks parcel as picked up.
func (p *Parcel) Pickup(now time.Time) error {
	if p.Status != StatusPickupReady {
		return ErrInvalidStatusTransition
	}
	p.PickedUpAt = &now
	p.Status = StatusPickedUp
	return nil
}

// Expire marks parcel as expired.
func (p *Parcel) Expire(now time.Time) error {
	if p.Status != StatusPickupReady {
		return ErrInvalidStatusTransition
	}
	p.Status = StatusExpired
	if p.ExpiresAt == nil {
		p.ExpiresAt = &now
	}
	return nil
}
