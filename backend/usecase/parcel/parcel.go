package parcel

import (
	"context"

	"github.com/google/uuid"

	"smart-parcel-locker/backend/domain/parcel"
)

// UseCase handles parcel read workflows.
type UseCase struct {
	parcelRepo parcel.Repository
}

func NewUseCase(parcelRepo parcel.Repository) *UseCase {
	return &UseCase{parcelRepo: parcelRepo}
}

// GetByID fetches a parcel by identifier.
func (uc *UseCase) GetByID(ctx context.Context, id uuid.UUID) (*parcel.Parcel, error) {
	return uc.parcelRepo.GetByID(ctx, id)
}
