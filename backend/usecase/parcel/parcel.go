package parcel

import (
	"context"
	"crypto/rand"
	"log"
	"math/big"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/compartment"
	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/infrastructure/database"
	"smart-parcel-locker/backend/pkg/errorx"
)

type parcelRepository interface {
	parcel.Repository
	WithDB(db *gorm.DB) parcel.Repository
}

type lockerRepository interface {
	locker.Repository
	WithDB(db *gorm.DB) locker.Repository
}

type compartmentRepository interface {
	compartment.Repository
	WithDB(db *gorm.DB) compartment.Repository
}

// UseCase handles parcel workflows.
type UseCase struct {
	parcelRepo      parcelRepository
	lockerRepo      lockerRepository
	compartmentRepo compartmentRepository
	tx              *database.TransactionManager
}

type DepositInput struct {
	LockerID      uuid.UUID
	Size          string
	ReceiverPhone string
	SenderPhone   string
}

type DepositResult struct {
	ParcelID   uuid.UUID
	ParcelCode string
	PickupCode *string
	Status     parcel.Status
}

func NewUseCase(
	parcelRepo parcel.Repository,
	lockerRepo locker.Repository,
	compartmentRepo compartment.Repository,
	tx *database.TransactionManager,
) *UseCase {
	if tx == nil {
		tx = database.NewTransactionManager(nil)
	}
	return &UseCase{
		parcelRepo: parcelRepo.(interface {
			parcel.Repository
			WithDB(*gorm.DB) parcel.Repository
		}),
		lockerRepo: lockerRepo.(interface {
			locker.Repository
			WithDB(*gorm.DB) locker.Repository
		}),
		compartmentRepo: compartmentRepo.(interface {
			compartment.Repository
			WithDB(*gorm.DB) compartment.Repository
		}),
		tx: tx,
	}
}

// GetByID fetches a parcel by identifier.
func (uc *UseCase) GetByID(ctx context.Context, id uuid.UUID) (*parcel.Parcel, error) {
	return uc.parcelRepo.GetByID(ctx, id)
}

// Deposit creates a parcel and assigns it to an available compartment.
func (uc *UseCase) Deposit(ctx context.Context, input DepositInput) (*DepositResult, error) {
	if err := validateDepositInput(input); err != nil {
		return nil, err
	}

	var result *DepositResult
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		var parcelRepo parcel.Repository = uc.parcelRepo
		var lockerRepo locker.Repository = uc.lockerRepo
		var compartmentRepo compartment.Repository = uc.compartmentRepo
		if tx != nil {
			parcelRepo = uc.parcelRepo.WithDB(tx)
			lockerRepo = uc.lockerRepo.WithDB(tx)
			compartmentRepo = uc.compartmentRepo.WithDB(tx)
		}

		lockerEntity, err := lockerRepo.GetByID(ctx, input.LockerID)
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				return errorx.Error{Code: "NOT_FOUND", Message: "locker not found"}
			}
			return err
		}
		if lockerEntity.Status != locker.StatusActive {
			return locker.ErrLockerInactive
		}

		// Best-fit selection: try the smallest compartment that can fit the requested size.
		candidateSizes := bestFitSizes(input.Size)
		log.Printf("deposit best-fit requested_size=%s candidates=%s", input.Size, strings.Join(candidateSizes, ","))
		comp, err := compartmentRepo.FindAvailableByLockerSizesForUpdate(ctx, input.LockerID, candidateSizes)
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				return locker.ErrNoAvailableSlot
			}
			return err
		}
		log.Printf("deposit compartment selected compartment_id=%s size=%s", comp.ID.String(), comp.Size)

		parcelID := uuid.New()
		if err := comp.Reserve(parcelID); err != nil {
			return err
		}
		if _, err := compartmentRepo.Update(ctx, comp); err != nil {
			return err
		}
		log.Printf("deposit compartment reserved compartment_id=%s status=%s", comp.ID.String(), comp.Status)

		if err := comp.Occupy(parcelID); err != nil {
			return err
		}
		if _, err := compartmentRepo.Update(ctx, comp); err != nil {
			return err
		}

		now := time.Now()
		pickupCode := generateCode("PU-", 6)
		entity := &parcel.Parcel{
			ID:            parcelID,
			ParcelCode:    generateCode("PR-", 10),
			LockerID:      input.LockerID,
			CompartmentID: &comp.ID,
			Size:          input.Size,
			ReceiverPhone: input.ReceiverPhone,
			SenderPhone:   input.SenderPhone,
			PickupCode:    &pickupCode,
			Status:        parcel.StatusReadyForPickup,
			DepositedAt:   &now,
			CreatedAt:     now,
			UpdatedAt:     &now,
		}

		created, err := parcelRepo.Create(ctx, entity)
		if err != nil {
			return err
		}
		if err := parcelRepo.CreateEvent(ctx, &parcel.Event{
			ID:        uuid.New(),
			ParcelID:  created.ID,
			EventType: string(parcel.StatusReadyForPickup),
			CreatedAt: now,
		}); err != nil {
			return err
		}

		result = &DepositResult{
			ParcelID:   created.ID,
			ParcelCode: created.ParcelCode,
			PickupCode: created.PickupCode,
			Status:     created.Status,
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return result, nil
}

func bestFitSizes(requested string) []string {
	switch requested {
	case "S":
		return []string{"S", "M", "L"}
	case "M":
		return []string{"M", "L"}
	case "L":
		return []string{"L"}
	default:
		return nil
	}
}

func validateDepositInput(input DepositInput) error {
	if input.ReceiverPhone == "" || input.SenderPhone == "" {
		return parcel.ErrInvalidRequest
	}
	if !isNumeric(input.ReceiverPhone) || !isNumeric(input.SenderPhone) {
		return errorx.Error{Code: "INVALID_REQUEST", Message: "invalid phone format"}
	}
	switch input.Size {
	case "S", "M", "L":
	default:
		return errorx.Error{Code: "INVALID_REQUEST", Message: "invalid size"}
	}
	return nil
}

func isNumeric(value string) bool {
	for _, r := range value {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}

func generateCode(prefix string, digits int) string {
	const charset = "0123456789"
	result := make([]byte, digits)
	for i := range result {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			result[i] = '0'
			continue
		}
		result[i] = charset[n.Int64()]
	}
	return prefix + string(result)
}
