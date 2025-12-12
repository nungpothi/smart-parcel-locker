package locker

import (
	"context"

	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/infrastructure/database"

	"gorm.io/gorm"
)

// RetrieveInput carries retrieval parameters.
type RetrieveInput struct {
	LockerID uint
	ParcelID uint
}

// RetrieveUseCase orchestrates parcel retrieval from a locker.
type RetrieveUseCase struct {
	lockerRepo locker.Repository
	parcelRepo parcel.Repository
	tx         *database.TransactionManager
}

func NewRetrieveUseCase(lockerRepo locker.Repository, parcelRepo parcel.Repository, tx *database.TransactionManager) *RetrieveUseCase {
	return &RetrieveUseCase{
		lockerRepo: lockerRepo,
		parcelRepo: parcelRepo,
		tx:         tx,
	}
}

func (uc *RetrieveUseCase) Execute(ctx context.Context, input RetrieveInput) (*parcel.Parcel, error) {
	var result *parcel.Parcel

	run := func() error {
		lockerEntity, err := uc.lockerRepo.GetLockerWithSlots(ctx, input.LockerID)
		if err != nil {
			return err
		}

		service := locker.NewLockerService(lockerEntity)
		slot := findSlotByParcelID(lockerEntity.Slots, input.ParcelID)
		if slot == nil {
			return locker.ErrParcelNotFound
		}

		parcelEntity, err := uc.parcelRepo.GetByID(ctx, input.ParcelID)
		if err != nil {
			return err
		}

		parcelEntity.SetStatus("retrieved")
		service.ReleaseSlot(slot)

		if _, err := uc.parcelRepo.Update(ctx, parcelEntity); err != nil {
			return err
		}

		if _, err := uc.lockerRepo.UpdateSlot(ctx, slot); err != nil {
			return err
		}

		result = parcelEntity
		return nil
	}

	if uc.tx != nil {
		if err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error { return run() }); err != nil {
			return nil, err
		}
	} else {
		if err := run(); err != nil {
			return nil, err
		}
	}

	return result, nil
}

func findSlotByParcelID(slots []locker.Slot, parcelID uint) *locker.Slot {
	for i := range slots {
		if slots[i].ParcelID != nil && *slots[i].ParcelID == parcelID {
			return &slots[i]
		}
	}
	return nil
}
