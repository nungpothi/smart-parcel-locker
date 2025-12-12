package locker

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/compartment"
	"smart-parcel-locker/backend/domain/locker"
	gormmodels "smart-parcel-locker/backend/infrastructure/persistence/gorm/models"
)

// GormRepository provides data access for lockers and slots.
type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) WithDB(db *gorm.DB) locker.Repository {
	return &GormRepository{db: db}
}

func (r *GormRepository) GetLockerWithCompartments(ctx context.Context, lockerID uuid.UUID) (*locker.Locker, error) {
	var lockerModel gormmodels.Locker
	if err := r.db.WithContext(ctx).First(&lockerModel, "id = ?", lockerID).Error; err != nil {
		return nil, err
	}

	var compartments []gormmodels.Compartment
	if err := r.db.WithContext(ctx).Where("locker_id = ?", lockerID).Find(&compartments).Error; err != nil {
		return nil, err
	}

	compartmentIDs := make([]uuid.UUID, 0, len(compartments))
	for _, c := range compartments {
		compartmentIDs = append(compartmentIDs, c.ID)
	}

	parcelByCompartment := map[uuid.UUID]uuid.UUID{}
	if len(compartmentIDs) > 0 {
		var parcels []gormmodels.Parcel
		if err := r.db.WithContext(ctx).Where("compartment_id IN ?", compartmentIDs).Find(&parcels).Error; err != nil {
			return nil, err
		}
		for _, p := range parcels {
			if p.CompartmentID != nil {
				parcelByCompartment[*p.CompartmentID] = p.ID
			}
		}
	}

	domainLocker := mapLockerModelToDomain(lockerModel, compartments, parcelByCompartment)
	return domainLocker, nil
}

func (r *GormRepository) UpdateCompartment(ctx context.Context, c *compartment.Compartment) (*compartment.Compartment, error) {
	model := gormmodels.Compartment{
		ID:       c.ID,
		LockerID: c.LockerID,
		Status:   c.Status,
		Size:     c.Size,
	}

	if err := r.db.WithContext(ctx).Model(&gormmodels.Compartment{}).Where("id = ?", c.ID).Updates(model).Error; err != nil {
		return nil, err
	}
	return c, nil
}

func mapLockerModelToDomain(model gormmodels.Locker, compartments []gormmodels.Compartment, parcelByCompartment map[uuid.UUID]uuid.UUID) *locker.Locker {
	comps := make([]compartment.Compartment, 0, len(compartments))
	for _, c := range compartments {
		comp := compartment.Compartment{
			ID:            c.ID,
			LockerID:      c.LockerID,
			CompartmentNo: c.CompartmentNo,
			Size:          c.Size,
			Status:        c.Status,
			CreatedAt:     c.CreatedAt,
		}
		if c.UpdatedAt != nil {
			comp.UpdatedAt = c.UpdatedAt
		}
		if parcelID, ok := parcelByCompartment[c.ID]; ok {
			comp.ParcelID = &parcelID
		}
		comps = append(comps, comp)
	}

	lockerEntity := locker.Locker{
		ID:           model.ID,
		LocationID:   model.LocationID,
		LockerCode:   model.LockerCode,
		Name:         derefString(model.Name),
		Status:       model.Status,
		Compartments: comps,
		CreatedAt:    model.CreatedAt,
	}
	if model.UpdatedAt != nil {
		lockerEntity.UpdatedAt = model.UpdatedAt
	}
	return &lockerEntity
}

func derefString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
