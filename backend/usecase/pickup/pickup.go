package pickup

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/compartment"
	"smart-parcel-locker/backend/domain/parcel"
	pickupdomain "smart-parcel-locker/backend/domain/pickup"
	"smart-parcel-locker/backend/infrastructure/database"
	"smart-parcel-locker/backend/pkg/errorx"
)

type parcelRepository interface {
	parcel.Repository
	WithDB(db *gorm.DB) parcel.Repository
}

type compartmentRepository interface {
	compartment.Repository
	WithDB(db *gorm.DB) compartment.Repository
}

// UseCase handles pickup parcel listing.
type UseCase struct {
	parcelRepo      parcelRepository
	compartmentRepo compartmentRepository
	tokenStore      pickupdomain.TokenStore
	tx              *database.TransactionManager
	now             func() time.Time
}

// NewUseCase constructs pickup use case.
func NewUseCase(
	parcelRepo parcel.Repository,
	compartmentRepo compartment.Repository,
	tokenStore pickupdomain.TokenStore,
	tx *database.TransactionManager,
) *UseCase {
	if tokenStore == nil {
		tokenStore = noopTokenStore{}
	}
	if tx == nil {
		tx = database.NewTransactionManager(nil)
	}
	return &UseCase{
		parcelRepo: parcelRepo.(interface {
			parcel.Repository
			WithDB(db *gorm.DB) parcel.Repository
		}),
		compartmentRepo: compartmentRepo.(interface {
			compartment.Repository
			WithDB(db *gorm.DB) compartment.Repository
		}),
		tokenStore: tokenStore,
		tx:         tx,
		now:        time.Now,
	}
}

// ListParcels returns eligible parcels for a pickup token.
func (uc *UseCase) ListParcels(ctx context.Context, token string) ([]*parcel.Parcel, error) {
	info, err := uc.validateToken(token)
	if err != nil {
		return nil, err
	}
	items, err := uc.parcelRepo.ListReadyForPickupByPhone(ctx, info.Phone)
	if err != nil {
		return nil, err
	}
	log.Printf("pickup parcels found=%d", len(items))
	return items, nil
}

type ConfirmResult struct {
	ParcelID   uuid.UUID
	Status     parcel.Status
	PickedUpAt time.Time
}

// ConfirmPickup updates parcel and compartment status after pickup.
func (uc *UseCase) ConfirmPickup(ctx context.Context, token string, parcelID uuid.UUID) (*ConfirmResult, error) {
	if parcelID == uuid.Nil {
		return nil, errorx.Error{Code: "INVALID_REQUEST", Message: "invalid parcel_id"}
	}
	info, err := uc.validateToken(token)
	if err != nil {
		return nil, err
	}

	var result *ConfirmResult
	err = uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		var parcelRepo parcel.Repository = uc.parcelRepo
		var compartmentRepo compartment.Repository = uc.compartmentRepo
		if tx != nil {
			parcelRepo = uc.parcelRepo.WithDB(tx)
			compartmentRepo = uc.compartmentRepo.WithDB(tx)
		}

		entity, err := parcelRepo.GetByIDForUpdate(ctx, parcelID)
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				return parcel.ErrParcelNotFound
			}
			return err
		}

		if entity.Status != parcel.StatusReadyForPickup {
			return errorx.Error{Code: "CONFLICT", Message: "parcel not ready for pickup"}
		}
		if entity.ReceiverPhone != info.Phone && entity.SenderPhone != info.Phone {
			return errorx.Error{Code: "FORBIDDEN", Message: "parcel does not belong to token"}
		}
		if entity.CompartmentID == nil {
			return errorx.Error{Code: "CONFLICT", Message: "parcel has no compartment"}
		}

		comp, err := compartmentRepo.GetByIDForUpdate(ctx, *entity.CompartmentID)
		if err != nil {
			return err
		}
		if err := comp.Release(); err != nil {
			return err
		}

		now := uc.now()
		entity.Status = parcel.StatusPickedUp
		entity.PickedUpAt = &now
		if _, err := parcelRepo.Update(ctx, entity); err != nil {
			return err
		}
		if _, err := compartmentRepo.Update(ctx, comp); err != nil {
			return err
		}
		if err := parcelRepo.CreateEvent(ctx, &parcel.Event{
			ID:        uuid.New(),
			ParcelID:  entity.ID,
			EventType: string(parcel.StatusPickedUp),
			CreatedAt: now,
		}); err != nil {
			return err
		}

		result = &ConfirmResult{
			ParcelID:   entity.ID,
			Status:     entity.Status,
			PickedUpAt: now,
		}
		log.Printf("pickup confirmed parcel_id=%s phone=%s", entity.ID.String(), maskPhone(info.Phone))
		return nil
	})
	if err != nil {
		return nil, err
	}
	return result, nil
}

type noopTokenStore struct{}

func (noopTokenStore) Store(token string, phone string, expiresAt time.Time) {}

func (noopTokenStore) Get(token string) (pickupdomain.TokenInfo, bool) {
	return pickupdomain.TokenInfo{}, false
}

func (uc *UseCase) validateToken(token string) (pickupdomain.TokenInfo, error) {
	if token == "" {
		log.Printf("pickup token missing")
		return pickupdomain.TokenInfo{}, pickupdomain.ErrInvalidToken
	}
	info, ok := uc.tokenStore.Get(token)
	if !ok {
		log.Printf("pickup token invalid")
		return pickupdomain.TokenInfo{}, pickupdomain.ErrInvalidToken
	}
	if uc.now().After(info.ExpiresAt) {
		log.Printf("pickup token expired")
		return pickupdomain.TokenInfo{}, pickupdomain.ErrTokenExpired
	}
	return info, nil
}

func maskPhone(phone string) string {
	if len(phone) <= 4 {
		return "****"
	}
	return "****" + phone[len(phone)-4:]
}
