package pickup

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/compartment"
	"smart-parcel-locker/backend/domain/parcel"
	pickupdomain "smart-parcel-locker/backend/domain/pickup"
	"smart-parcel-locker/backend/infrastructure/database"
	"smart-parcel-locker/backend/pkg/errorx"
	"smart-parcel-locker/backend/pkg/logger"
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
	logger.Info(ctx, "pickup usecase list parcels started", map[string]interface{}{
		"tokenPresent": token != "",
	}, "")
	info, err := uc.validateToken(ctx, token)
	if err != nil {
		logger.Warn(ctx, "pickup usecase list parcels token invalid", map[string]interface{}{
			"error": err.Error(),
		}, "")
		return nil, err
	}
	items, err := uc.parcelRepo.ListReadyForPickupByPhone(ctx, info.Phone)
	if err != nil {
		logger.Error(ctx, "pickup usecase list parcels failed unexpectedly", map[string]interface{}{
			"receiverPhone": maskPhone(info.Phone),
			"error":         err.Error(),
		}, "")
		return nil, err
	}
	logger.Info(ctx, "pickup usecase list parcels completed", map[string]interface{}{
		"receiverPhone": maskPhone(info.Phone),
		"count":         len(items),
	}, "")
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
		logger.Warn(ctx, "pickup usecase confirm invalid parcel_id", map[string]interface{}{
			"parcelId": parcelID.String(),
		}, "")
		return nil, errorx.Error{Code: "INVALID_REQUEST", Message: "invalid parcel_id"}
	}
	logger.Info(ctx, "pickup usecase confirm started", map[string]interface{}{
		"parcelId": parcelID.String(),
	}, "")
	info, err := uc.validateToken(ctx, token)
	if err != nil {
		logger.Warn(ctx, "pickup usecase confirm token invalid", map[string]interface{}{
			"parcelId": parcelID.String(),
			"error":    err.Error(),
		}, "")
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
				logger.Warn(ctx, "pickup usecase confirm parcel not found", map[string]interface{}{
					"parcelId": parcelID.String(),
				}, "")
				return parcel.ErrParcelNotFound
			}
			logger.Error(ctx, "pickup usecase confirm load parcel failed unexpectedly", map[string]interface{}{
				"parcelId": parcelID.String(),
				"error":    err.Error(),
			}, "")
			return err
		}

		if entity.Status != parcel.StatusReadyForPickup {
			logger.Warn(ctx, "pickup usecase confirm invalid parcel status", map[string]interface{}{
				"parcelId": parcelID.String(),
				"status":   entity.Status,
			}, "")
			return errorx.Error{Code: "CONFLICT", Message: "parcel not ready for pickup"}
		}
		if entity.ReceiverPhone != info.Phone && entity.SenderPhone != info.Phone {
			logger.Warn(ctx, "pickup usecase confirm phone mismatch", map[string]interface{}{
				"parcelId": parcelID.String(),
				"phone":    maskPhone(info.Phone),
			}, "")
			return errorx.Error{Code: "FORBIDDEN", Message: "parcel does not belong to token"}
		}
		if entity.CompartmentID == nil {
			logger.Warn(ctx, "pickup usecase confirm missing compartment", map[string]interface{}{
				"parcelId": parcelID.String(),
			}, "")
			return errorx.Error{Code: "CONFLICT", Message: "parcel has no compartment"}
		}

		comp, err := compartmentRepo.GetByIDForUpdate(ctx, *entity.CompartmentID)
		if err != nil {
			logger.Error(ctx, "pickup usecase confirm load compartment failed unexpectedly", map[string]interface{}{
				"parcelId":      parcelID.String(),
				"compartmentId": entity.CompartmentID.String(),
				"error":         err.Error(),
			}, "")
			return err
		}
		if err := comp.Release(); err != nil {
			logger.Warn(ctx, "pickup usecase confirm invalid compartment transition", map[string]interface{}{
				"parcelId":      parcelID.String(),
				"compartmentId": comp.ID.String(),
				"error":         err.Error(),
			}, "")
			return err
		}

		now := uc.now()
		entity.Status = parcel.StatusPickedUp
		entity.PickedUpAt = &now
		if _, err := parcelRepo.Update(ctx, entity); err != nil {
			logger.Error(ctx, "pickup usecase confirm update parcel failed unexpectedly", map[string]interface{}{
				"parcelId": parcelID.String(),
				"error":    err.Error(),
			}, "")
			return err
		}
		if _, err := compartmentRepo.Update(ctx, comp); err != nil {
			logger.Error(ctx, "pickup usecase confirm update compartment failed unexpectedly", map[string]interface{}{
				"parcelId":      parcelID.String(),
				"compartmentId": comp.ID.String(),
				"error":         err.Error(),
			}, "")
			return err
		}
		if err := parcelRepo.CreateEvent(ctx, &parcel.Event{
			ID:        uuid.New(),
			ParcelID:  entity.ID,
			EventType: string(parcel.StatusPickedUp),
			CreatedAt: now,
		}); err != nil {
			logger.Error(ctx, "pickup usecase confirm create event failed unexpectedly", map[string]interface{}{
				"parcelId": parcelID.String(),
				"error":    err.Error(),
			}, "")
			return err
		}

		result = &ConfirmResult{
			ParcelID:   entity.ID,
			Status:     entity.Status,
			PickedUpAt: now,
		}
		logger.Info(ctx, "pickup usecase confirm completed", map[string]interface{}{
			"parcelId": parcelID.String(),
			"phone":    maskPhone(info.Phone),
			"status":   entity.Status,
		}, "")
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

func (uc *UseCase) validateToken(ctx context.Context, token string) (pickupdomain.TokenInfo, error) {
	if token == "" {
		logger.Warn(ctx, "pickup usecase token missing", map[string]interface{}{}, "")
		return pickupdomain.TokenInfo{}, pickupdomain.ErrInvalidToken
	}
	info, ok := uc.tokenStore.Get(token)
	if !ok {
		logger.Warn(ctx, "pickup usecase token invalid", map[string]interface{}{}, "")
		return pickupdomain.TokenInfo{}, pickupdomain.ErrInvalidToken
	}
	if uc.now().After(info.ExpiresAt) {
		logger.Warn(ctx, "pickup usecase token expired", map[string]interface{}{
			"phone": maskPhone(info.Phone),
		}, "")
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
