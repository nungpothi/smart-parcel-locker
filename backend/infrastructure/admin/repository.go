package admin

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/admin"
)

// GormRepository provides data access for Admin entities.
type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) WithDB(db *gorm.DB) admin.Repository {
	return &GormRepository{db: db}
}

func (r *GormRepository) Create(ctx context.Context, a *admin.Admin) (*admin.Admin, error) {
	if err := r.db.WithContext(ctx).Create(a).Error; err != nil {
		return nil, err
	}
	return a, nil
}

func (r *GormRepository) GetByID(ctx context.Context, id uuid.UUID) (*admin.Admin, error) {
	var entity admin.Admin
	if err := r.db.WithContext(ctx).First(&entity, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &entity, nil
}

func (r *GormRepository) Update(ctx context.Context, a *admin.Admin) (*admin.Admin, error) {
	if err := r.db.WithContext(ctx).Save(a).Error; err != nil {
		return nil, err
	}
	return a, nil
}

func (r *GormRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&admin.Admin{}, "id = ?", id).Error
}
