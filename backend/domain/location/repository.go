package location

import (
	"context"

	"github.com/google/uuid"
)

// Repository defines data access for locations.
type Repository interface {
	Create(ctx context.Context, loc *Location) (*Location, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Location, error)
	List(ctx context.Context) ([]Location, error)
	Count(ctx context.Context) (int64, error)
}
