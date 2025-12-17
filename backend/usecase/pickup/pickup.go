package pickup

import (
	"context"
	"log"
	"time"

	"smart-parcel-locker/backend/domain/parcel"
	pickupdomain "smart-parcel-locker/backend/domain/pickup"
)

type parcelRepository interface {
	ListReadyForPickupByPhone(ctx context.Context, phone string) ([]*parcel.Parcel, error)
}

// UseCase handles pickup parcel listing.
type UseCase struct {
	parcelRepo parcelRepository
	tokenStore pickupdomain.TokenStore
	now        func() time.Time
}

// NewUseCase constructs pickup use case.
func NewUseCase(parcelRepo parcelRepository, tokenStore pickupdomain.TokenStore) *UseCase {
	if tokenStore == nil {
		tokenStore = noopTokenStore{}
	}
	return &UseCase{
		parcelRepo: parcelRepo,
		tokenStore: tokenStore,
		now:        time.Now,
	}
}

// ListParcels returns eligible parcels for a pickup token.
func (uc *UseCase) ListParcels(ctx context.Context, token string) ([]*parcel.Parcel, error) {
	if token == "" {
		log.Printf("pickup token missing")
		return nil, pickupdomain.ErrInvalidToken
	}
	info, ok := uc.tokenStore.Get(token)
	if !ok {
		log.Printf("pickup token invalid")
		return nil, pickupdomain.ErrInvalidToken
	}
	if uc.now().After(info.ExpiresAt) {
		log.Printf("pickup token expired")
		return nil, pickupdomain.ErrTokenExpired
	}
	items, err := uc.parcelRepo.ListReadyForPickupByPhone(ctx, info.Phone)
	if err != nil {
		return nil, err
	}
	log.Printf("pickup parcels found=%d", len(items))
	return items, nil
}

type noopTokenStore struct{}

func (noopTokenStore) Store(token string, phone string, expiresAt time.Time) {}

func (noopTokenStore) Get(token string) (pickupdomain.TokenInfo, bool) {
	return pickupdomain.TokenInfo{}, false
}
