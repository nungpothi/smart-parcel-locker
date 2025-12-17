package compartment

import (
	"time"

	"github.com/google/uuid"
)

const (
	StatusAvailable    = "AVAILABLE"
	StatusReserved     = "RESERVED"
	StatusOccupied     = "OCCUPIED"
	StatusOutOfService = "OUT_OF_SERVICE"
)

// Compartment represents an individual locker compartment.
type Compartment struct {
	ID            uuid.UUID
	LockerID      uuid.UUID
	CompartmentNo int
	Size          string // S | M | L
	Status        string
	ParcelID      *uuid.UUID
	CreatedAt     time.Time
	UpdatedAt     *time.Time
}

// Reserve sets the compartment to reserved when available.
func (c *Compartment) Reserve(parcelID uuid.UUID) error {
	if c.Status != StatusAvailable {
		return ErrInvalidCompartmentStatus
	}
	c.Status = StatusReserved
	c.ParcelID = &parcelID
	return nil
}

// Occupy marks the compartment as occupied after deposit.
func (c *Compartment) Occupy(parcelID uuid.UUID) error {
	if c.Status != StatusReserved && c.Status != StatusAvailable {
		return ErrInvalidCompartmentStatus
	}
	c.Status = StatusOccupied
	c.ParcelID = &parcelID
	return nil
}

// Release frees the compartment back to available.
func (c *Compartment) Release() error {
	if c.Status != StatusReserved && c.Status != StatusOccupied {
		return ErrInvalidCompartmentStatus
	}
	c.Status = StatusAvailable
	c.ParcelID = nil
	return nil
}
