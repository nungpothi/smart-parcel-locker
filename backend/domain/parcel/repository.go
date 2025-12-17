package parcel

import (
	"context"

	"github.com/google/uuid"
)

// Repository defines data access for parcels.
type Repository interface {
	Create(ctx context.Context, parcel *Parcel) (*Parcel, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Parcel, error)
	GetByIDForUpdate(ctx context.Context, id uuid.UUID) (*Parcel, error)
	Update(ctx context.Context, parcel *Parcel) (*Parcel, error)
	CreateEvent(ctx context.Context, event *Event) error
	CountByStatus(ctx context.Context, statuses []Status) (int64, error)
	ListReadyForPickupByPhone(ctx context.Context, phone string) ([]*Parcel, error)
}
