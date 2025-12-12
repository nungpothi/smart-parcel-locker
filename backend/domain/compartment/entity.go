package compartment

import (
	"time"

	"github.com/google/uuid"
)

const (
	StatusAvailable = "AVAILABLE"
	StatusOccupied  = "OCCUPIED"
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
