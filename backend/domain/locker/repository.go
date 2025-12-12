package locker

import (
	"context"

	"github.com/google/uuid"

	"smart-parcel-locker/backend/domain/compartment"
)

// Repository defines data access for lockers and compartments.
type Repository interface {
	GetLockerWithCompartments(ctx context.Context, lockerID uuid.UUID) (*Locker, error)
	UpdateCompartment(ctx context.Context, c *compartment.Compartment) (*compartment.Compartment, error)
}
