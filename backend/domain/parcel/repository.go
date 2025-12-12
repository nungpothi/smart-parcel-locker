package parcel

import "context"

// Repository defines data access for parcels.
type Repository interface {
	Create(ctx context.Context, parcel *Parcel) (*Parcel, error)
	GetByID(ctx context.Context, id uint) (*Parcel, error)
	Update(ctx context.Context, parcel *Parcel) (*Parcel, error)
}
