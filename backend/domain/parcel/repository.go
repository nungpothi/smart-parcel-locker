package parcel

import (
	"context"

	"github.com/google/uuid"
)

// Repository defines data access for parcels.
type Repository interface {
	Create(ctx context.Context, parcel *Parcel) (*Parcel, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Parcel, error)
	Update(ctx context.Context, parcel *Parcel) (*Parcel, error)
}
