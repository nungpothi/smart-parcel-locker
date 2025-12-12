package parcel

import (
	"context"

	"smart-parcel-locker/backend/domain/parcel"

	"gorm.io/gorm"
)

// GormRepository provides data access for parcels.
type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) Create(ctx context.Context, p *parcel.Parcel) (*parcel.Parcel, error) {
	// TODO: persist parcel using GORM.
	return p, nil
}

func (r *GormRepository) GetByID(ctx context.Context, id uint) (*parcel.Parcel, error) {
	// TODO: retrieve parcel.
	return &parcel.Parcel{ID: id}, nil
}

func (r *GormRepository) Update(ctx context.Context, p *parcel.Parcel) (*parcel.Parcel, error) {
	// TODO: update parcel.
	return p, nil
}
