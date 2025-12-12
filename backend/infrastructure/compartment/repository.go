package compartment

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

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
