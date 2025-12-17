package adminops

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/compartment"
	"smart-parcel-locker/backend/domain/location"
	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/infrastructure/database"
)

// UseCase handles admin operational flows.
type UseCase struct {
	locationRepo location.Repository
	lockerRepo   locker.Repository
	compRepo     compartment.Repository
	parcelRepo   parcel.Repository
	tx           *database.TransactionManager

	locationRepoFactory func(db *gorm.DB) location.Repository
	lockerRepoFactory   func(db *gorm.DB) locker.Repository
	compRepoFactory     func(db *gorm.DB) compartment.Repository
	parcelRepoFactory   func(db *gorm.DB) parcel.Repository
}

type CreateLocationInput struct {
	Code     string
	Name     string
	Address  *string
	IsActive *bool
}

type CreateLockerInput struct {
	LocationID uuid.UUID
	LockerCode string
	Name       string
}

type UpdateLockerStatusInput struct {
	LockerID uuid.UUID
	Status   string
}

type CompartmentSpec struct {
	CompartmentNo int
	Size          string
}

type CreateCompartmentsInput struct {
	LockerID     uuid.UUID
	Compartments []CompartmentSpec
}

type Overview struct {
	TotalLocations        int64
	TotalLockers          int64
	TotalCompartments     int64
	CompartmentsAvailable int64
	ParcelsActive         int64
	ParcelsExpired        int64
}

func NewUseCase(
	locationRepo location.Repository,
	lockerRepo locker.Repository,
	compRepo compartment.Repository,
	parcelRepo parcel.Repository,
	tx *database.TransactionManager,
) *UseCase {
	if tx == nil {
		tx = database.NewTransactionManager(nil)
	}

	uc := &UseCase{
		locationRepo: locationRepo,
		lockerRepo:   lockerRepo,
		compRepo:     compRepo,
		parcelRepo:   parcelRepo,
		tx:           tx,
	}

	if r, ok := locationRepo.(interface {
		WithDB(*gorm.DB) location.Repository
	}); ok {
		uc.locationRepoFactory = func(db *gorm.DB) location.Repository { return r.WithDB(db) }
	}
	if r, ok := lockerRepo.(interface {
		WithDB(*gorm.DB) locker.Repository
	}); ok {
		uc.lockerRepoFactory = func(db *gorm.DB) locker.Repository { return r.WithDB(db) }
	}
	if r, ok := compRepo.(interface {
		WithDB(*gorm.DB) compartment.Repository
	}); ok {
		uc.compRepoFactory = func(db *gorm.DB) compartment.Repository { return r.WithDB(db) }
	}
	if r, ok := parcelRepo.(interface {
		WithDB(*gorm.DB) parcel.Repository
	}); ok {
		uc.parcelRepoFactory = func(db *gorm.DB) parcel.Repository { return r.WithDB(db) }
	}

	return uc
}

func (uc *UseCase) repoWithTx(db *gorm.DB) (*UseCase, error) {
	if db == nil {
		return uc, nil
	}
	cp := *uc
	if uc.locationRepoFactory != nil {
		cp.locationRepo = uc.locationRepoFactory(db)
	}
	if uc.lockerRepoFactory != nil {
		cp.lockerRepo = uc.lockerRepoFactory(db)
	}
	if uc.compRepoFactory != nil {
		cp.compRepo = uc.compRepoFactory(db)
	}
	if uc.parcelRepoFactory != nil {
		cp.parcelRepo = uc.parcelRepoFactory(db)
	}
	return &cp, nil
}

// CreateLocation inserts a new location.
func (uc *UseCase) CreateLocation(ctx context.Context, input CreateLocationInput) (*location.Location, error) {
	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}
	entity := &location.Location{
		ID:       uuid.New(),
		Code:     input.Code,
		Name:     input.Name,
		Address:  input.Address,
		IsActive: isActive,
	}

	var result *location.Location
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		repos, _ := uc.repoWithTx(tx)
		created, err := repos.locationRepo.Create(ctx, entity)
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

func (uc *UseCase) ListLocations(ctx context.Context) ([]location.Location, error) {
	return uc.locationRepo.List(ctx)
}

// CreateLocker registers a locker under a location.
func (uc *UseCase) CreateLocker(ctx context.Context, input CreateLockerInput) (*locker.Locker, error) {
	entity := &locker.Locker{
		ID:         uuid.New(),
		LocationID: input.LocationID,
		LockerCode: input.LockerCode,
		Name:       input.Name,
		Status:     locker.StatusActive,
	}

	var result *locker.Locker
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		repos, _ := uc.repoWithTx(tx)
		if _, err := repos.locationRepo.GetByID(ctx, input.LocationID); err != nil {
			return err
		}
		created, err := repos.lockerRepo.Create(ctx, entity)
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

func (uc *UseCase) ListLockers(ctx context.Context) ([]locker.Locker, error) {
	return uc.lockerRepo.List(ctx)
}

// UpdateLockerStatus updates the status of a locker.
func (uc *UseCase) UpdateLockerStatus(ctx context.Context, input UpdateLockerStatusInput) (*locker.Locker, error) {
	if input.Status != locker.StatusActive && input.Status != locker.StatusMaintenance && input.Status != locker.StatusDisabled {
		return nil, errors.New("invalid status")
	}

	var result *locker.Locker
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		repos, _ := uc.repoWithTx(tx)
		updated, err := repos.lockerRepo.UpdateStatus(ctx, input.LockerID, input.Status)
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

// CreateCompartments creates compartments for a locker.
func (uc *UseCase) CreateCompartments(ctx context.Context, input CreateCompartmentsInput) (int, error) {
	if len(input.Compartments) == 0 {
		return 0, errors.New("compartments cannot be empty")
	}

	var createdCount int
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		repos, _ := uc.repoWithTx(tx)
		if _, err := repos.lockerRepo.GetByID(ctx, input.LockerID); err != nil {
			return err
		}

		now := time.Now()
		comps := make([]compartment.Compartment, 0, len(input.Compartments))
		for _, c := range input.Compartments {
			comps = append(comps, compartment.Compartment{
				ID:            uuid.New(),
				LockerID:      input.LockerID,
				CompartmentNo: c.CompartmentNo,
				Size:          c.Size,
				Status:        compartment.StatusAvailable,
				CreatedAt:     now,
			})
		}
		count, err := repos.compRepo.CreateBulk(ctx, comps)
		if err != nil {
			return err
		}
		createdCount = count
		return nil
	})
	if err != nil {
		return 0, err
	}
	return createdCount, nil
}

func (uc *UseCase) ListCompartments(ctx context.Context, lockerID uuid.UUID) ([]compartment.Compartment, error) {
	return uc.compRepo.ListByLocker(ctx, lockerID)
}

// Overview aggregates system stats.
func (uc *UseCase) Overview(ctx context.Context) (*Overview, error) {
	locCount, err := uc.locationRepo.Count(ctx)
	if err != nil {
		return nil, err
	}
	lockerCount, err := uc.lockerRepo.Count(ctx)
	if err != nil {
		return nil, err
	}
	compCount, err := uc.compRepo.CountAll(ctx)
	if err != nil {
		return nil, err
	}
	compAvailable, err := uc.compRepo.CountByStatus(ctx, compartment.StatusAvailable)
	if err != nil {
		return nil, err
	}
	activeStatuses := []parcel.Status{
		parcel.StatusDepositing,
		parcel.StatusReadyForPickup,
	}
	parcelsActive, err := uc.parcelRepo.CountByStatus(ctx, activeStatuses)
	if err != nil {
		return nil, err
	}
	parcelsExpired, err := uc.parcelRepo.CountByStatus(ctx, []parcel.Status{parcel.StatusExpired})
	if err != nil {
		return nil, err
	}
	return &Overview{
		TotalLocations:        locCount,
		TotalLockers:          lockerCount,
		TotalCompartments:     compCount,
		CompartmentsAvailable: compAvailable,
		ParcelsActive:         parcelsActive,
		ParcelsExpired:        parcelsExpired,
	}, nil
}
