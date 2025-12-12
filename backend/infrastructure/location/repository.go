package location

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/location"
	gormmodels "smart-parcel-locker/backend/infrastructure/persistence/gorm/models"
)

// GormRepository provides data access for locations.
type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) WithDB(db *gorm.DB) location.Repository {
	return &GormRepository{db: db}
}

func (r *GormRepository) Create(ctx context.Context, loc *location.Location) (*location.Location, error) {
	model := gormmodels.Location{
		ID:        loc.ID,
		Code:      loc.Code,
		Name:      loc.Name,
		Address:   loc.Address,
		IsActive:  loc.IsActive,
		CreatedAt: time.Now(),
	}
	if model.ID == uuid.Nil {
		model.ID = uuid.New()
	}
	if err := r.db.WithContext(ctx).Create(&model).Error; err != nil {
		return nil, err
	}
	return mapLocationModelToDomain(model), nil
}

func (r *GormRepository) GetByID(ctx context.Context, id uuid.UUID) (*location.Location, error) {
	var model gormmodels.Location
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return mapLocationModelToDomain(model), nil
}

func (r *GormRepository) List(ctx context.Context) ([]location.Location, error) {
	var models []gormmodels.Location
	if err := r.db.WithContext(ctx).Find(&models).Error; err != nil {
		return nil, err
	}
	result := make([]location.Location, 0, len(models))
	for _, m := range models {
		result = append(result, *mapLocationModelToDomain(m))
	}
	return result, nil
}

func (r *GormRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&gormmodels.Location{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func mapLocationModelToDomain(model gormmodels.Location) *location.Location {
	return &location.Location{
		ID:        model.ID,
		Code:      model.Code,
		Name:      model.Name,
		Address:   model.Address,
		IsActive:  model.IsActive,
		CreatedAt: model.CreatedAt,
		UpdatedAt: model.UpdatedAt,
	}
}
