package parcel

import (
	"context"
	"smart-parcel-locker/backend/domain/compartment"
	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/infrastructure/database"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UseCase handles parcel workflows.
type UseCase struct {
	parcelRepo interface {
		parcel.Repository
		WithDB(db *gorm.DB) parcel.Repository
	}
	lockerRepo interface {
		locker.Repository
		WithDB(db *gorm.DB) locker.Repository
	}
	tx *database.TransactionManager
}

type CreateInput struct {
	LockerID    uuid.UUID
	Size        string
	CourierID   uuid.UUID
	RecipientID uuid.UUID
	ExpiresAt   *time.Time
}

type ReserveInput struct {
	ParcelID uuid.UUID
}

type DepositInput struct {
	ParcelID uuid.UUID
}

type ReadyInput struct {
	ParcelID  uuid.UUID
	ExpiresAt *time.Time
}

type OTPRequestInput struct {
	ParcelID  uuid.UUID
	OTPCode   string
	ExpiresAt time.Time
}

type OTPVerifyInput struct {
	OTPRef  string
	OTPCode string
}

type PickupInput struct {
	ParcelID uuid.UUID
	OTPRef   string
}

func NewUseCase(parcelRepo parcel.Repository, lockerRepo locker.Repository, tx *database.TransactionManager) *UseCase {
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
		tx: tx,
	}
}

// Create initializes a parcel in CREATED state.
func (uc *UseCase) Create(ctx context.Context, input CreateInput) (*parcel.Parcel, error) {
	now := time.Now()
	entity := &parcel.Parcel{
		ID:          uuid.New(),
		ParcelCode:  uuid.NewString(),
		LockerID:    input.LockerID,
		Size:        input.Size,
		CourierID:   input.CourierID,
		RecipientID: input.RecipientID,
		Status:      parcel.StatusCreated,
		CreatedAt:   now,
		UpdatedAt:   &now,
		ExpiresAt:   input.ExpiresAt,
	}

	var result *parcel.Parcel
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		repo := uc.parcelRepo.WithDB(tx)
		created, err := repo.Create(ctx, entity)
		if err != nil {
			return err
		}
		event := &parcel.Event{ID: uuid.New(), ParcelID: created.ID, EventType: string(parcel.StatusCreated), CreatedAt: time.Now()}
		if err := repo.CreateEvent(ctx, event); err != nil {
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

// Reserve reserves a compartment for a parcel.
func (uc *UseCase) Reserve(ctx context.Context, input ReserveInput) (*parcel.Parcel, error) {
	var result *parcel.Parcel
	now := time.Now()
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		parcelRepo := uc.parcelRepo.WithDB(tx)
		lockerRepo := uc.lockerRepo.WithDB(tx)

		p, err := parcelRepo.GetByID(ctx, input.ParcelID)
		if err != nil {
			return err
		}
		lockerEntity, err := lockerRepo.GetLockerWithCompartments(ctx, p.LockerID)
		if err != nil {
			return err
		}
		if !lockerEntity.IsActive() {
			return locker.ErrLockerInactive
		}
		comp := selectAvailableCompartment(lockerEntity.Compartments, p.Size)
		if comp == nil {
			return locker.ErrNoAvailableSlot
		}
		if err := comp.Reserve(p.ID); err != nil {
			return err
		}
		if err := p.Reserve(comp.ID, now); err != nil {
			return err
		}
		if _, err := lockerRepo.UpdateCompartment(ctx, comp); err != nil {
			return err
		}
		updated, err := parcelRepo.Update(ctx, p)
		if err != nil {
			return err
		}
		event := &parcel.Event{ID: uuid.New(), ParcelID: updated.ID, EventType: string(parcel.StatusReserved), CreatedAt: time.Now()}
		if err := parcelRepo.CreateEvent(ctx, event); err != nil {
			return err
		}
		result = updated
		return nil
	})
	if err != nil {
		return nil, err
	}
	return result, nil
}

// Deposit marks parcel as stored and compartment occupied.
func (uc *UseCase) Deposit(ctx context.Context, input DepositInput) (*parcel.Parcel, error) {
	var result *parcel.Parcel
	now := time.Now()
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		parcelRepo := uc.parcelRepo.WithDB(tx)
		lockerRepo := uc.lockerRepo.WithDB(tx)

		p, err := parcelRepo.GetByID(ctx, input.ParcelID)
		if err != nil {
			return err
		}
		if p.CompartmentID == nil {
			return parcel.ErrInvalidStatusTransition
		}
		lockerEntity, err := lockerRepo.GetLockerWithCompartments(ctx, p.LockerID)
		if err != nil {
			return err
		}
		comp := findCompartment(lockerEntity.Compartments, *p.CompartmentID)
		if comp == nil {
			return locker.ErrParcelNotFound
		}
		if err := comp.Occupy(p.ID); err != nil {
			return err
		}
		if err := p.Store(now); err != nil {
			return err
		}
		if _, err := lockerRepo.UpdateCompartment(ctx, comp); err != nil {
			return err
		}
		updated, err := parcelRepo.Update(ctx, p)
		if err != nil {
			return err
		}
		event := &parcel.Event{ID: uuid.New(), ParcelID: updated.ID, EventType: string(parcel.StatusStored), CreatedAt: time.Now()}
		if err := parcelRepo.CreateEvent(ctx, event); err != nil {
			return err
		}
		result = updated
		return nil
	})
	if err != nil {
		return nil, err
	}
	return result, nil
}

// Ready marks parcel as ready for pickup.
func (uc *UseCase) Ready(ctx context.Context, input ReadyInput) (*parcel.Parcel, error) {
	var result *parcel.Parcel
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		parcelRepo := uc.parcelRepo.WithDB(tx)

		p, err := parcelRepo.GetByID(ctx, input.ParcelID)
		if err != nil {
			return err
		}
		if input.ExpiresAt != nil {
			p.ExpiresAt = input.ExpiresAt
		}
		if err := p.Ready(); err != nil {
			return err
		}
		updated, err := parcelRepo.Update(ctx, p)
		if err != nil {
			return err
		}
		event := &parcel.Event{ID: uuid.New(), ParcelID: updated.ID, EventType: string(parcel.StatusPickupReady), CreatedAt: time.Now()}
		if err := parcelRepo.CreateEvent(ctx, event); err != nil {
			return err
		}
		result = updated
		return nil
	})
	if err != nil {
		return nil, err
	}
	return result, nil
}

// RequestOTP generates a new OTP for pickup.
func (uc *UseCase) RequestOTP(ctx context.Context, input OTPRequestInput) (*parcel.OTP, error) {
	var result *parcel.OTP
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		parcelRepo := uc.parcelRepo.WithDB(tx)
		p, err := parcelRepo.GetByID(ctx, input.ParcelID)
		if err != nil {
			return err
		}
		if p.Status != parcel.StatusPickupReady {
			return parcel.ErrInvalidStatusTransition
		}
		hash, err := bcrypt.GenerateFromPassword([]byte(input.OTPCode), 12)
		if err != nil {
			return err
		}
		otp := &parcel.OTP{
			ID:        uuid.New(),
			ParcelID:  p.ID,
			OTPRef:    uuid.NewString(),
			OTPHash:   string(hash),
			Status:    parcel.OTPStatusActive,
			ExpiresAt: input.ExpiresAt,
			CreatedAt: time.Now(),
		}
		created, err := parcelRepo.CreateOTP(ctx, otp)
		if err != nil {
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

// VerifyOTP verifies an OTP reference and code.
func (uc *UseCase) VerifyOTP(ctx context.Context, input OTPVerifyInput) (*parcel.OTP, error) {
	var result *parcel.OTP
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		parcelRepo := uc.parcelRepo.WithDB(tx)
		otp, err := parcelRepo.GetOTPByRef(ctx, input.OTPRef)
		if err != nil {
			return err
		}
		now := time.Now()
		if now.After(otp.ExpiresAt) || now.Equal(otp.ExpiresAt) {
			otp.Expire()
			if _, err := parcelRepo.UpdateOTP(ctx, otp); err != nil {
				return err
			}
			return parcel.ErrOTPExpired
		}
		if err := bcrypt.CompareHashAndPassword([]byte(otp.OTPHash), []byte(input.OTPCode)); err != nil {
			return parcel.ErrOTPInvalid
		}
		if err := otp.Verify(now); err != nil {
			_, _ = parcelRepo.UpdateOTP(ctx, otp)
			return err
		}
		updated, err := parcelRepo.UpdateOTP(ctx, otp)
		if err != nil {
			return err
		}
		result = updated
		return nil
	})
	if err != nil {
		return nil, err
	}
	return result, nil
}

// Pickup finalizes pickup when OTP verified.
func (uc *UseCase) Pickup(ctx context.Context, input PickupInput) (*parcel.Parcel, error) {
	var result *parcel.Parcel
	now := time.Now()
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		parcelRepo := uc.parcelRepo.WithDB(tx)
		lockerRepo := uc.lockerRepo.WithDB(tx)

		p, err := parcelRepo.GetByID(ctx, input.ParcelID)
		if err != nil {
			return err
		}
		if p.Status != parcel.StatusPickupReady {
			return parcel.ErrInvalidStatusTransition
		}
		otp, err := parcelRepo.GetOTPByRef(ctx, input.OTPRef)
		if err != nil {
			return err
		}
		if otp.ParcelID != p.ID || otp.Status != parcel.OTPStatusVerified {
			return parcel.ErrOTPInvalid
		}
		if p.CompartmentID == nil {
			return parcel.ErrInvalidStatusTransition
		}
		lockerEntity, err := lockerRepo.GetLockerWithCompartments(ctx, p.LockerID)
		if err != nil {
			return err
		}
		comp := findCompartment(lockerEntity.Compartments, *p.CompartmentID)
		if comp == nil {
			return locker.ErrParcelNotFound
		}
		if err := p.Pickup(now); err != nil {
			return err
		}
		if err := comp.Release(); err != nil {
			return err
		}
		if _, err := lockerRepo.UpdateCompartment(ctx, comp); err != nil {
			return err
		}
		updated, err := parcelRepo.Update(ctx, p)
		if err != nil {
			return err
		}
		event := &parcel.Event{ID: uuid.New(), ParcelID: updated.ID, EventType: string(parcel.StatusPickedUp), CreatedAt: time.Now()}
		if err := parcelRepo.CreateEvent(ctx, event); err != nil {
			return err
		}
		result = updated
		return nil
	})
	if err != nil {
		return nil, err
	}
	return result, nil
}

// RunExpire expires parcels past due.
func (uc *UseCase) RunExpire(ctx context.Context) error {
	now := time.Now()
	parcels, err := uc.parcelRepo.FindReadyToExpire(ctx, now)
	if err != nil {
		return err
	}
	for _, p := range parcels {
		parcelID := p.ID
		if err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
			parcelRepo := uc.parcelRepo.WithDB(tx)
			lockerRepo := uc.lockerRepo.WithDB(tx)

			entity, err := parcelRepo.GetByID(ctx, parcelID)
			if err != nil {
				return err
			}
			if entity.Status != parcel.StatusPickupReady {
				return nil
			}
			if entity.CompartmentID != nil {
				lockerEntity, err := lockerRepo.GetLockerWithCompartments(ctx, entity.LockerID)
				if err != nil {
					return err
				}
				comp := findCompartment(lockerEntity.Compartments, *entity.CompartmentID)
				if comp != nil {
					_ = comp.Release()
					if _, err := lockerRepo.UpdateCompartment(ctx, comp); err != nil {
						return err
					}
				}
			}
			if err := entity.Expire(now); err != nil {
				return err
			}
			if _, err := parcelRepo.Update(ctx, entity); err != nil {
				return err
			}
			if err := parcelRepo.ExpireActiveOTPs(ctx, entity.ID); err != nil {
				return err
			}
			event := &parcel.Event{ID: uuid.New(), ParcelID: entity.ID, EventType: string(parcel.StatusExpired), CreatedAt: time.Now()}
			if err := parcelRepo.CreateEvent(ctx, event); err != nil {
				return err
			}
			return nil
		}); err != nil {
			return err
		}
	}
	return nil
}

func selectAvailableCompartment(comps []compartment.Compartment, size string) *compartment.Compartment {
	for i := range comps {
		if comps[i].Status == compartment.StatusAvailable && comps[i].Size == size {
			return &comps[i]
		}
	}
	return nil
}

func findCompartment(comps []compartment.Compartment, id uuid.UUID) *compartment.Compartment {
	for i := range comps {
		if comps[i].ID == id {
			return &comps[i]
		}
	}
	return nil
}
