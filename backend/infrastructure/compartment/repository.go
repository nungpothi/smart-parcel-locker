package compartment

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"smart-parcel-locker/backend/domain/compartment"
	gormmodels "smart-parcel-locker/backend/infrastructure/persistence/gorm/models"
)

// GormRepository provides data access for compartments.
type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) WithDB(db *gorm.DB) compartment.Repository {
	return &GormRepository{db: db}
}

func (r *GormRepository) CreateBulk(ctx context.Context, compartments []compartment.Compartment) (int, error) {
	if len(compartments) == 0 {
		return 0, nil
	}
	models := make([]gormmodels.Compartment, 0, len(compartments))
	now := time.Now()
	for _, c := range compartments {
		models = append(models, gormmodels.Compartment{
			ID:            c.ID,
			LockerID:      c.LockerID,
			CompartmentNo: c.CompartmentNo,
			Size:          c.Size,
			Status:        c.Status,
			CreatedAt:     now,
		})
	}
	if err := r.db.WithContext(ctx).Create(&models).Error; err != nil {
		return 0, err
	}
	return len(models), nil
}

func (r *GormRepository) FindAvailableByLockerAndSizeForUpdate(ctx context.Context, lockerID uuid.UUID, size string) (*compartment.Compartment, error) {
	var model gormmodels.Compartment
	if err := r.db.WithContext(ctx).
		Clauses(clause.Locking{Strength: "UPDATE", Options: "SKIP LOCKED"}).
		Where("locker_id = ? AND size = ? AND status = ?", lockerID, size, compartment.StatusAvailable).
		Order("compartment_no asc").
		Limit(1).
		Take(&model).Error; err != nil {
		return nil, err
	}
	return &compartment.Compartment{
		ID:            model.ID,
		LockerID:      model.LockerID,
		CompartmentNo: model.CompartmentNo,
		Size:          model.Size,
		Status:        model.Status,
		CreatedAt:     model.CreatedAt,
		UpdatedAt:     model.UpdatedAt,
	}, nil
}

func (r *GormRepository) FindAvailableByLockerSizesForUpdate(ctx context.Context, lockerID uuid.UUID, sizes []string) (*compartment.Compartment, error) {
	if len(sizes) == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	sizeOrder := "CASE size WHEN 'S' THEN 1 WHEN 'M' THEN 2 WHEN 'L' THEN 3 ELSE 4 END"
	var model gormmodels.Compartment
	// Lock and skip competing rows so concurrent deposits don't select the same compartment.
	if err := r.db.WithContext(ctx).
		Clauses(clause.Locking{Strength: "UPDATE", Options: "SKIP LOCKED"}).
		Where("locker_id = ? AND size IN ? AND status = ?", lockerID, sizes, compartment.StatusAvailable).
		Order(sizeOrder).
		Order("compartment_no asc").
		Limit(1).
		Take(&model).Error; err != nil {
		return nil, err
	}
	return &compartment.Compartment{
		ID:            model.ID,
		LockerID:      model.LockerID,
		CompartmentNo: model.CompartmentNo,
		Size:          model.Size,
		Status:        model.Status,
		CreatedAt:     model.CreatedAt,
		UpdatedAt:     model.UpdatedAt,
	}, nil
}

func (r *GormRepository) GetByIDForUpdate(ctx context.Context, id uuid.UUID) (*compartment.Compartment, error) {
	var model gormmodels.Compartment
	if err := r.db.WithContext(ctx).
		Clauses(clause.Locking{Strength: "UPDATE"}).
		First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &compartment.Compartment{
		ID:            model.ID,
		LockerID:      model.LockerID,
		CompartmentNo: model.CompartmentNo,
		Size:          model.Size,
		Status:        model.Status,
		CreatedAt:     model.CreatedAt,
		UpdatedAt:     model.UpdatedAt,
	}, nil
}

func (r *GormRepository) Update(ctx context.Context, comp *compartment.Compartment) (*compartment.Compartment, error) {
	if comp == nil {
		return nil, nil
	}
	now := time.Now()
	model := gormmodels.Compartment{
		ID:            comp.ID,
		LockerID:      comp.LockerID,
		CompartmentNo: comp.CompartmentNo,
		Status:        comp.Status,
		Size:          comp.Size,
		UpdatedAt:     &now,
	}
	if err := r.db.WithContext(ctx).
		Model(&gormmodels.Compartment{}).
		Where("id = ?", comp.ID).
		Updates(model).Error; err != nil {
		return nil, err
	}
	return comp, nil
}

func (r *GormRepository) ListByLocker(ctx context.Context, lockerID uuid.UUID) ([]compartment.Compartment, error) {
	var models []gormmodels.Compartment
	if err := r.db.WithContext(ctx).
		Where("locker_id = ?", lockerID).
		Order("compartment_no asc").
		Find(&models).Error; err != nil {
		return nil, err
	}
	result := make([]compartment.Compartment, 0, len(models))
	for _, m := range models {
		c := compartment.Compartment{
			ID:            m.ID,
			LockerID:      m.LockerID,
			CompartmentNo: m.CompartmentNo,
			Size:          m.Size,
			Status:        m.Status,
			CreatedAt:     m.CreatedAt,
			UpdatedAt:     m.UpdatedAt,
		}
		result = append(result, c)
	}
	return result, nil
}

func (r *GormRepository) CountAll(ctx context.Context) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&gormmodels.Compartment{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *GormRepository) CountByStatus(ctx context.Context, status string) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Model(&gormmodels.Compartment{}).
		Where("status = ?", status).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
