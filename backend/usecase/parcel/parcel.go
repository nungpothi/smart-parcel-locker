package parcel

import (
	"context"

	"smart-parcel-locker/backend/domain/parcel"
)

// UseCase handles parcel operations.
type UseCase struct {
	repo parcel.Repository
}

type CreateInput struct {
	LockerID uint
	SlotID   uint
	Size     int
	Status   string
}

func NewUseCase(repo parcel.Repository) *UseCase {
	return &UseCase{repo: repo}
}

func (uc *UseCase) Create(ctx context.Context, input CreateInput) (*parcel.Parcel, error) {
	entity := &parcel.Parcel{
		LockerID: input.LockerID,
		SlotID:   input.SlotID,
		Size:     input.Size,
		Status:   input.Status,
	}
	// TODO: add validations.
	return uc.repo.Create(ctx, entity)
}

func (uc *UseCase) Get(ctx context.Context, id uint) (*parcel.Parcel, error) {
	return uc.repo.GetByID(ctx, id)
}
