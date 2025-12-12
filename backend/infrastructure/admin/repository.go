package admin

import (
	"context"

	"smart-parcel-locker/backend/domain/admin"

	"gorm.io/gorm"
)

// GormRepository provides data access for Admin entities.
type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) Create(ctx context.Context, a *admin.Admin) (*admin.Admin, error) {
	// TODO: persist admin using GORM.
	return a, nil
}

func (r *GormRepository) GetByID(ctx context.Context, id uint) (*admin.Admin, error) {
	// TODO: retrieve admin.
	return &admin.Admin{ID: id}, nil
}

func (r *GormRepository) Update(ctx context.Context, a *admin.Admin) (*admin.Admin, error) {
	// TODO: update admin.
	return a, nil
}

func (r *GormRepository) Delete(ctx context.Context, id uint) error {
	// TODO: delete admin.
	return nil
}
