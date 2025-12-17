package parcel

import (
	"context"

	"github.com/google/uuid"
)

// Repository defines data access for parcels.
type Repository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*Parcel, error)
	CountByStatus(ctx context.Context, statuses []Status) (int64, error)
}
