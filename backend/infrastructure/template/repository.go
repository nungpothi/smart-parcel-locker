package template

import (
	"context"

	"smart-parcel-locker/backend/domain/template"

	"gorm.io/gorm"
)

// GormRepository provides a GORM-based implementation for the Template repository.
type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) Create(ctx context.Context, entity template.Template) (*template.Template, error) {
	// TODO: persist entity using GORM.
	return &entity, nil
}

func (r *GormRepository) GetByID(ctx context.Context, id uint) (*template.Template, error) {
	// TODO: retrieve entity using GORM.
	return nil, nil
}

func (r *GormRepository) Update(ctx context.Context, entity template.Template) (*template.Template, error) {
	// TODO: update entity using GORM.
	return &entity, nil
}

func (r *GormRepository) Delete(ctx context.Context, id uint) error {
	// TODO: delete entity using GORM.
	return nil
}
