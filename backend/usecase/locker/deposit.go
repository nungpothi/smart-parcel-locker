package locker

import (
	"context"
	"time"

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
	if tx == nil {
		tx = database.NewTransactionManager(nil)
	}
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

	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		lockerRepo := uc.lockerRepo.WithDB(tx)
		parcelRepo := uc.parcelRepo.WithDB(tx)

		lockerEntity, err := lockerRepo.GetLockerWithSlots(ctx, input.LockerID)
		if err != nil {
			return err
		}

		service := locker.NewLockerService(lockerEntity)
		parcelEntity := &parcel.Parcel{
			LockerID:    input.LockerID,
			Size:        input.ParcelSize,
			Status:      parcel.StatusDeposited,
			PickupCode:  uuid.New().String(),
			DepositedAt: time.Now(),
		}

		if err := service.ValidateDeposit(parcelEntity); err != nil {
			return err
		}

		slot, err := service.SelectBestFitSlot(parcelEntity)
		if err != nil {
			return err
		}

		parcelEntity.SlotID = slot.ID

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
	})

	if err != nil {
		return nil, err
	}

	return result, nil
}
