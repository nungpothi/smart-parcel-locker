package locker

import (
	"context"

	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/infrastructure/database"

	"gorm.io/gorm"
)

// DepositInput carries deposit parameters.
type DepositInput struct {
	LockerID   uint
	ParcelSize int
}

// DepositUseCase orchestrates parcel deposit into a locker.
type DepositUseCase struct {
	lockerRepo locker.Repository
	parcelRepo parcel.Repository
	tx         *database.TransactionManager
}

func NewDepositUseCase(lockerRepo locker.Repository, parcelRepo parcel.Repository, tx *database.TransactionManager) *DepositUseCase {
	return &DepositUseCase{
		lockerRepo: lockerRepo,
		parcelRepo: parcelRepo,
		tx:         tx,
	}
}

func (uc *DepositUseCase) Execute(ctx context.Context, input DepositInput) (*parcel.Parcel, error) {
	var result *parcel.Parcel
	run := func() error {
		lockerEntity, err := uc.lockerRepo.GetLockerWithSlots(ctx, input.LockerID)
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

		service.MarkOccupied(slot, parcelEntity.ID)
		parcelEntity.SlotID = slot.ID
		parcelEntity.SetStatus("deposited")

		if _, err := uc.parcelRepo.Create(ctx, parcelEntity); err != nil {
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
