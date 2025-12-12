package parcel

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/parcel"
)

// GormRepository provides data access for parcels.
type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) WithDB(db *gorm.DB) parcel.Repository {
	return &GormRepository{db: db}
}

func (r *GormRepository) Create(ctx context.Context, p *parcel.Parcel) (*parcel.Parcel, error) {
	if err := r.db.WithContext(ctx).Create(p).Error; err != nil {
		return nil, err
	}
	return p, nil
}

func (r *GormRepository) GetByID(ctx context.Context, id uuid.UUID) (*parcel.Parcel, error) {
	var entity parcel.Parcel
	if err := r.db.WithContext(ctx).First(&entity, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &entity, nil
}

func (r *GormRepository) Update(ctx context.Context, p *parcel.Parcel) (*parcel.Parcel, error) {
	if err := r.db.WithContext(ctx).Save(p).Error; err != nil {
		return nil, err
	}
	return p, nil
}
