package lockerquery

import (
	"context"

	"github.com/google/uuid"

	"smart-parcel-locker/backend/domain/location"
	"smart-parcel-locker/backend/domain/locker"
)

// UseCase provides query-style operations for lockers.
type UseCase struct {
	lockerRepo   locker.Repository
	locationRepo location.Repository
}

// AvailableLocker represents the public data for an active locker.
type AvailableLocker struct {
	LockerID     uuid.UUID
	LockerCode   string
	LocationName string
}

// NewUseCase constructs the locker query use case.
func NewUseCase(lockerRepo locker.Repository, locationRepo location.Repository) *UseCase {
	return &UseCase{
		lockerRepo:   lockerRepo,
		locationRepo: locationRepo,
	}
}

// ListAvailable returns all active lockers with their location names.
func (uc *UseCase) ListAvailable(ctx context.Context) ([]AvailableLocker, error) {
	lockers, err := uc.lockerRepo.List(ctx)
	if err != nil {
		return nil, err
	}
	locations, err := uc.locationRepo.List(ctx)
	if err != nil {
		return nil, err
	}
	locationByID := make(map[uuid.UUID]string, len(locations))
	for _, loc := range locations {
		locationByID[loc.ID] = loc.Name
	}

	result := make([]AvailableLocker, 0, len(lockers))
	for _, l := range lockers {
		if l.Status != locker.StatusActive {
			continue
		}
		result = append(result, AvailableLocker{
			LockerID:     l.ID,
			LockerCode:   l.LockerCode,
			LocationName: locationByID[l.LocationID],
		})
	}
	return result, nil
}
