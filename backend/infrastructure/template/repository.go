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

func (r *GormRepository) Create(ctx context.Context, entity template.Template) error {
	// TODO: persist entity using GORM.
	return nil
}

func (r *GormRepository) FindByID(ctx context.Context, id uint) (*template.Template, error) {
	// TODO: retrieve entity using GORM.
	return nil, nil
}
