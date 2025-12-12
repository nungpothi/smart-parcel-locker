package locker

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/infrastructure/database"
)

// DepositInput carries deposit parameters.
type DepositInput struct {
	LockerID   uuid.UUID
	ParcelSize int
}

// DepositUseCase orchestrates parcel deposit into a locker.
type DepositUseCase struct {
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

func NewDepositUseCase(lockerRepo locker.Repository, parcelRepo parcel.Repository, tx *database.TransactionManager) *DepositUseCase {
	return &DepositUseCase{
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

func (uc *DepositUseCase) Execute(ctx context.Context, input DepositInput) (*parcel.Parcel, error) {
	var result *parcel.Parcel
	run := func(lockerRepo locker.Repository, parcelRepo parcel.Repository) error {
		lockerEntity, err := lockerRepo.GetLockerWithSlots(ctx, input.LockerID)
		if err != nil {
			return err
		}

		service := locker.NewLockerService(lockerEntity)
		parcelEntity := &parcel.Parcel{
			LockerID: input.LockerID,
			Size:     input.ParcelSize,
			Status:   "pending",
		}

		if err := service.ValidateDeposit(parcelEntity); err != nil {
			return err
		}

		slot, err := service.SelectBestFitSlot(parcelEntity)
		if err != nil {
			return err
		}

		parcelEntity.SlotID = slot.ID
		parcelEntity.SetStatus("deposited")

		created, err := parcelRepo.Create(ctx, parcelEntity)
		if err != nil {
			return err
		}

		service.MarkOccupied(slot, created.ID)

		if _, err := parcelRepo.Update(ctx, created); err != nil {
			return err
		}

		if _, err := lockerRepo.UpdateSlot(ctx, slot); err != nil {
			return err
		}

		result = created
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
