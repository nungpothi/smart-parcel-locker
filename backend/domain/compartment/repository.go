package compartment

import (
	"context"

	"github.com/google/uuid"
)

// Repository defines data access for compartments.
type Repository interface {
	CreateBulk(ctx context.Context, compartments []Compartment) (int, error)
	FindAvailableByLockerSizesForUpdate(ctx context.Context, lockerID uuid.UUID, sizes []string) (*Compartment, error)
	GetByIDForUpdate(ctx context.Context, id uuid.UUID) (*Compartment, error)
	Update(ctx context.Context, compartment *Compartment) (*Compartment, error)
	ListByLocker(ctx context.Context, lockerID uuid.UUID) ([]Compartment, error)
	CountAll(ctx context.Context) (int64, error)
	CountByStatus(ctx context.Context, status string) (int64, error)
}
