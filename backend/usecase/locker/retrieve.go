//go:build ignore

package locker

import (
	"context"
	"smart-parcel-locker/backend/domain/compartment"
	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/infrastructure/database"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
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
	if tx == nil {
		tx = database.NewTransactionManager(nil)
	}
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

	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		lockerRepo := uc.lockerRepo.WithDB(tx)
		parcelRepo := uc.parcelRepo.WithDB(tx)

		lockerEntity, err := lockerRepo.GetLockerWithCompartments(ctx, input.LockerID)
		if err != nil {
			return err
		}

		service := locker.NewLockerService(lockerEntity)
		comp := findCompartmentByParcelID(lockerEntity.Compartments, input.ParcelID)
		if comp == nil {
			return locker.ErrParcelNotFound
		}

		parcelEntity, err := parcelRepo.GetByID(ctx, input.ParcelID)
		if err != nil {
			return err
		}

		now := time.Now()
		parcelEntity.SetStatus(parcel.StatusRetrieved)
		parcelEntity.PickedUpAt = &now
		service.ReleaseCompartment(comp)

		if _, err := parcelRepo.Update(ctx, parcelEntity); err != nil {
			return err
		}

		if _, err := lockerRepo.UpdateCompartment(ctx, comp); err != nil {
			return err
		}

		result = parcelEntity
		return nil
	})

	if err != nil {
		return nil, err
	}

	return result, nil
}

func findCompartmentByParcelID(comps []compartment.Compartment, parcelID uuid.UUID) *compartment.Compartment {
	for i := range comps {
		if comps[i].ParcelID != nil && *comps[i].ParcelID == parcelID {
			return &comps[i]
		}
	}
	return nil
}
