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
	"smart-parcel-locker/backend/pkg/logger"
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
	CompartmentNo    int
	Size             string
	OverdueFeePerDay int
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
	logger.Info(ctx, "admin ops usecase create location started", map[string]interface{}{
		"locationCode": input.Code,
		"name":         input.Name,
	}, "")
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
			logger.Error(ctx, "admin ops usecase create location failed unexpectedly", map[string]interface{}{
				"locationCode": input.Code,
				"name":         input.Name,
				"error":        err.Error(),
			}, "")
			return err
		}
		result = created
		return nil
	})
	if err != nil {
		return nil, err
	}
	logger.Info(ctx, "admin ops usecase location created", map[string]interface{}{
		"locationId":   result.ID,
		"locationCode": result.Code,
		"name":         result.Name,
		"status":       result.IsActive,
	}, "")
	return result, nil
}

func (uc *UseCase) ListLocations(ctx context.Context) ([]location.Location, error) {
	logger.Info(ctx, "admin ops usecase list locations started", map[string]interface{}{}, "")
	items, err := uc.locationRepo.List(ctx)
	if err != nil {
		logger.Error(ctx, "admin ops usecase list locations failed unexpectedly", map[string]interface{}{
			"error": err.Error(),
		}, "")
		return nil, err
	}
	logger.Info(ctx, "admin ops usecase list locations completed", map[string]interface{}{
		"count": len(items),
	}, "")
	return items, nil
}

// CreateLocker registers a locker under a location.
func (uc *UseCase) CreateLocker(ctx context.Context, input CreateLockerInput) (*locker.Locker, error) {
	logger.Info(ctx, "admin ops usecase create locker started", map[string]interface{}{
		"locationId": input.LocationID.String(),
		"lockerCode": input.LockerCode,
	}, "")
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
			if errors.Is(err, gorm.ErrRecordNotFound) {
				logger.Warn(ctx, "admin ops usecase create locker location not found", map[string]interface{}{
					"locationId": input.LocationID.String(),
					"lockerCode": input.LockerCode,
				}, "")
			} else {
				logger.Error(ctx, "admin ops usecase create locker load location failed unexpectedly", map[string]interface{}{
					"locationId": input.LocationID.String(),
					"lockerCode": input.LockerCode,
					"error":      err.Error(),
				}, "")
			}
			return err
		}
		created, err := repos.lockerRepo.Create(ctx, entity)
		if err != nil {
			logger.Error(ctx, "admin ops usecase create locker failed unexpectedly", map[string]interface{}{
				"locationId": input.LocationID.String(),
				"lockerCode": input.LockerCode,
				"error":      err.Error(),
			}, "")
			return err
		}
		result = created
		return nil
	})
	if err != nil {
		return nil, err
	}
	logger.Info(ctx, "admin ops usecase locker created", map[string]interface{}{
		"lockerId":   result.ID,
		"lockerCode": result.LockerCode,
		"locationId": result.LocationID,
		"status":     result.Status,
	}, "")
	return result, nil
}

func (uc *UseCase) ListLockers(ctx context.Context) ([]locker.Locker, error) {
	logger.Info(ctx, "admin ops usecase list lockers started", map[string]interface{}{}, "")
	items, err := uc.lockerRepo.List(ctx)
	if err != nil {
		logger.Error(ctx, "admin ops usecase list lockers failed unexpectedly", map[string]interface{}{
			"error": err.Error(),
		}, "")
		return nil, err
	}
	logger.Info(ctx, "admin ops usecase list lockers completed", map[string]interface{}{
		"count": len(items),
	}, "")
	return items, nil
}

// UpdateLockerStatus updates the status of a locker.
func (uc *UseCase) UpdateLockerStatus(ctx context.Context, input UpdateLockerStatusInput) (*locker.Locker, error) {
	if input.Status != locker.StatusActive && input.Status != locker.StatusMaintenance && input.Status != locker.StatusDisabled {
		logger.Warn(ctx, "admin ops usecase update locker invalid status", map[string]interface{}{
			"lockerId": input.LockerID.String(),
			"status":   input.Status,
		}, "")
		return nil, errors.New("invalid status")
	}

	var result *locker.Locker
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		repos, _ := uc.repoWithTx(tx)
		updated, err := repos.lockerRepo.UpdateStatus(ctx, input.LockerID, input.Status)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				logger.Warn(ctx, "admin ops usecase update locker not found", map[string]interface{}{
					"lockerId": input.LockerID.String(),
					"status":   input.Status,
				}, "")
			} else {
				logger.Error(ctx, "admin ops usecase update locker failed unexpectedly", map[string]interface{}{
					"lockerId": input.LockerID.String(),
					"status":   input.Status,
					"error":    err.Error(),
				}, "")
			}
			return err
		}
		result = updated
		return nil
	})
	if err != nil {
		return nil, err
	}
	logger.Info(ctx, "admin ops usecase locker status updated", map[string]interface{}{
		"lockerId": result.ID,
		"status":   result.Status,
	}, "")
	return result, nil
}

// CreateCompartments creates compartments for a locker.
func (uc *UseCase) CreateCompartments(ctx context.Context, input CreateCompartmentsInput) (int, error) {
	if len(input.Compartments) == 0 {
		logger.Warn(ctx, "admin ops usecase create compartments empty", map[string]interface{}{
			"lockerId": input.LockerID.String(),
		}, "")
		return 0, errors.New("compartments cannot be empty")
	}

	var createdCount int
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		repos, _ := uc.repoWithTx(tx)
		if _, err := repos.lockerRepo.GetByID(ctx, input.LockerID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				logger.Warn(ctx, "admin ops usecase create compartments locker not found", map[string]interface{}{
					"lockerId": input.LockerID.String(),
				}, "")
			} else {
				logger.Error(ctx, "admin ops usecase create compartments load locker failed unexpectedly", map[string]interface{}{
					"lockerId": input.LockerID.String(),
					"error":    err.Error(),
				}, "")
			}
			return err
		}

		now := time.Now()
		comps := make([]compartment.Compartment, 0, len(input.Compartments))
		for _, c := range input.Compartments {
			comps = append(comps, compartment.Compartment{
				ID:               uuid.New(),
				LockerID:         input.LockerID,
				CompartmentNo:    c.CompartmentNo,
				Size:             c.Size,
				Status:           compartment.StatusAvailable,
				OverdueFeePerDay: c.OverdueFeePerDay,
				CreatedAt:        now,
			})
		}
		count, err := repos.compRepo.CreateBulk(ctx, comps)
		if err != nil {
			logger.Error(ctx, "admin ops usecase create compartments failed unexpectedly", map[string]interface{}{
				"lockerId": input.LockerID.String(),
				"error":    err.Error(),
			}, "")
			return err
		}
		createdCount = count
		return nil
	})
	if err != nil {
		return 0, err
	}
	logger.Info(ctx, "admin ops usecase compartments created", map[string]interface{}{
		"lockerId":     input.LockerID.String(),
		"createdCount": createdCount,
	}, "")
	return createdCount, nil
}

func (uc *UseCase) ListCompartments(ctx context.Context, lockerID uuid.UUID) ([]compartment.Compartment, error) {
	logger.Info(ctx, "admin ops usecase list compartments started", map[string]interface{}{
		"lockerId": lockerID.String(),
	}, "")
	items, err := uc.compRepo.ListByLocker(ctx, lockerID)
	if err != nil {
		logger.Error(ctx, "admin ops usecase list compartments failed unexpectedly", map[string]interface{}{
			"lockerId": lockerID.String(),
			"error":    err.Error(),
		}, "")
		return nil, err
	}
	logger.Info(ctx, "admin ops usecase list compartments completed", map[string]interface{}{
		"lockerId": lockerID.String(),
		"count":    len(items),
	}, "")
	return items, nil
}

// Overview aggregates system stats.
func (uc *UseCase) Overview(ctx context.Context) (*Overview, error) {
	logger.Info(ctx, "admin ops usecase overview started", map[string]interface{}{}, "")
	locCount, err := uc.locationRepo.Count(ctx)
	if err != nil {
		logger.Error(ctx, "admin ops usecase overview failed on locations", map[string]interface{}{
			"error": err.Error(),
		}, "")
		return nil, err
	}
	lockerCount, err := uc.lockerRepo.Count(ctx)
	if err != nil {
		logger.Error(ctx, "admin ops usecase overview failed on lockers", map[string]interface{}{
			"error": err.Error(),
		}, "")
		return nil, err
	}
	compCount, err := uc.compRepo.CountAll(ctx)
	if err != nil {
		logger.Error(ctx, "admin ops usecase overview failed on compartments", map[string]interface{}{
			"error": err.Error(),
		}, "")
		return nil, err
	}
	compAvailable, err := uc.compRepo.CountByStatus(ctx, compartment.StatusAvailable)
	if err != nil {
		logger.Error(ctx, "admin ops usecase overview failed on compartments available", map[string]interface{}{
			"error": err.Error(),
		}, "")
		return nil, err
	}
	activeStatuses := []parcel.Status{
		parcel.StatusDepositing,
		parcel.StatusReadyForPickup,
	}
	parcelsActive, err := uc.parcelRepo.CountByStatus(ctx, activeStatuses)
	if err != nil {
		logger.Error(ctx, "admin ops usecase overview failed on parcels active", map[string]interface{}{
			"error": err.Error(),
		}, "")
		return nil, err
	}
	parcelsExpired, err := uc.parcelRepo.CountByStatus(ctx, []parcel.Status{parcel.StatusExpired})
	if err != nil {
		logger.Error(ctx, "admin ops usecase overview failed on parcels expired", map[string]interface{}{
			"error": err.Error(),
		}, "")
		return nil, err
	}
	logger.Info(ctx, "admin ops usecase overview completed", map[string]interface{}{
		"totalLocations":        locCount,
		"totalLockers":          lockerCount,
		"totalCompartments":     compCount,
		"compartmentsAvailable": compAvailable,
		"parcelsActive":         parcelsActive,
		"parcelsExpired":        parcelsExpired,
	}, "")
	return &Overview{
		TotalLocations:        locCount,
		TotalLockers:          lockerCount,
		TotalCompartments:     compCount,
		CompartmentsAvailable: compAvailable,
		ParcelsActive:         parcelsActive,
		ParcelsExpired:        parcelsExpired,
	}, nil
}
