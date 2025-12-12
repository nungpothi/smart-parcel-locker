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
	Create(ctx context.Context, locker *Locker) (*Locker, error)
	GetByID(ctx context.Context, lockerID uuid.UUID) (*Locker, error)
	List(ctx context.Context) ([]Locker, error)
	UpdateStatus(ctx context.Context, lockerID uuid.UUID, status string) (*Locker, error)
	Count(ctx context.Context) (int64, error)
}
