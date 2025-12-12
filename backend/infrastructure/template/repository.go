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

func (r *GormRepository) WithDB(db *gorm.DB) template.Repository {
	return &GormRepository{db: db}
}

func (r *GormRepository) Create(ctx context.Context, entity *template.Template) (*template.Template, error) {
	if err := r.db.WithContext(ctx).Create(entity).Error; err != nil {
		return nil, err
	}
	return entity, nil
}

func (r *GormRepository) GetByID(ctx context.Context, id string) (*template.Template, error) {
	var entity template.Template
	if err := r.db.WithContext(ctx).First(&entity, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &entity, nil
}

func (r *GormRepository) List(ctx context.Context) ([]template.Template, error) {
	var results []template.Template
	if err := r.db.WithContext(ctx).Find(&results).Error; err != nil {
		return nil, err
	}
	return results, nil
}

func (r *GormRepository) Update(ctx context.Context, entity *template.Template) (*template.Template, error) {
	if err := r.db.WithContext(ctx).Save(entity).Error; err != nil {
		return nil, err
	}
	return entity, nil
}

func (r *GormRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&template.Template{}, "id = ?", id).Error
}
