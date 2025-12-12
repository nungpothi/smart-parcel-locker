package locker

import (
	"context"

	"smart-parcel-locker/backend/domain/locker"

	"gorm.io/gorm"
)

// GormRepository provides data access for lockers and slots.
type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) GetLockerWithSlots(ctx context.Context, lockerID uint) (*locker.Locker, error) {
	// TODO: load locker with slots using GORM eager loading.
	return &locker.Locker{ID: lockerID}, nil
}

func (r *GormRepository) UpdateSlot(ctx context.Context, slot *locker.Slot) (*locker.Slot, error) {
	// TODO: update slot in database.
	return slot, nil
}
