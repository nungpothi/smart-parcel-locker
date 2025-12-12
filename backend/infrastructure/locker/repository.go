package locker

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/locker"
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

func (r *GormRepository) GetLockerWithSlots(ctx context.Context, lockerID uuid.UUID) (*locker.Locker, error) {
	var entity locker.Locker
	if err := r.db.WithContext(ctx).Preload("Slots").First(&entity, "id = ?", lockerID).Error; err != nil {
		return nil, err
	}
	return &entity, nil
}

func (r *GormRepository) UpdateSlot(ctx context.Context, slot *locker.Slot) (*locker.Slot, error) {
	if err := r.db.WithContext(ctx).Save(slot).Error; err != nil {
		return nil, err
	}
	return slot, nil
}
