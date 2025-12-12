package locker

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/infrastructure/database"
)

// RetrieveInput carries retrieval parameters.
type RetrieveInput struct {
	LockerID uuid.UUID
	ParcelID uuid.UUID
}

// RetrieveUseCase orchestrates parcel retrieval from a locker.
type RetrieveUseCase struct {
	lockerRepo interface {
		locker.Repository
		WithDB(db *gorm.DB) locker.Repository
	}
	parcelRepo interface {
		parcel.Repository
		WithDB(db *gorm.DB) parcel.Repository
	}
	tx *database.TransactionManager
}

func NewRetrieveUseCase(lockerRepo locker.Repository, parcelRepo parcel.Repository, tx *database.TransactionManager) *RetrieveUseCase {
	return &RetrieveUseCase{
		lockerRepo: lockerRepo.(interface {
			locker.Repository
			WithDB(*gorm.DB) locker.Repository
		}),
		parcelRepo: parcelRepo.(interface {
			parcel.Repository
			WithDB(*gorm.DB) parcel.Repository
		}),
		tx: tx,
	}
}

func (uc *RetrieveUseCase) Execute(ctx context.Context, input RetrieveInput) (*parcel.Parcel, error) {
	var result *parcel.Parcel

	run := func(lockerRepo locker.Repository, parcelRepo parcel.Repository) error {
		lockerEntity, err := lockerRepo.GetLockerWithSlots(ctx, input.LockerID)
		if err != nil {
			return err
		}

		service := locker.NewLockerService(lockerEntity)
		slot := findSlotByParcelID(lockerEntity.Slots, input.ParcelID)
		if slot == nil {
			return locker.ErrParcelNotFound
		}

		parcelEntity, err := parcelRepo.GetByID(ctx, input.ParcelID)
		if err != nil {
			return err
		}

		parcelEntity.SetStatus("retrieved")
		service.ReleaseSlot(slot)

		if _, err := parcelRepo.Update(ctx, parcelEntity); err != nil {
			return err
		}

		if _, err := lockerRepo.UpdateSlot(ctx, slot); err != nil {
			return err
		}

		result = parcelEntity
		return nil
	}

	if uc.tx != nil {
		if err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
			lr := uc.lockerRepo.WithDB(tx)
			pr := uc.parcelRepo.WithDB(tx)
			return run(lr, pr)
		}); err != nil {
			return nil, err
		}
	} else {
		if err := run(uc.lockerRepo, uc.parcelRepo); err != nil {
			return nil, err
		}
	}

	return result, nil
}

func findSlotByParcelID(slots []locker.Slot, parcelID uuid.UUID) *locker.Slot {
	for i := range slots {
		if slots[i].ParcelID != nil && *slots[i].ParcelID == parcelID {
			return &slots[i]
		}
	}
	return nil
}
