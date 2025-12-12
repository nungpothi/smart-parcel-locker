package parcel

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/parcel"
	gormmodels "smart-parcel-locker/backend/infrastructure/persistence/gorm/models"
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
	model := mapParcelDomainToModel(p)
	if err := r.db.WithContext(ctx).Create(&model).Error; err != nil {
		return nil, err
	}
	return mapParcelModelToDomain(model), nil
}

func (r *GormRepository) GetByID(ctx context.Context, id uuid.UUID) (*parcel.Parcel, error) {
	var model gormmodels.Parcel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return mapParcelModelToDomain(model), nil
}

func (r *GormRepository) Update(ctx context.Context, p *parcel.Parcel) (*parcel.Parcel, error) {
	model := mapParcelDomainToModel(p)
	if err := r.db.WithContext(ctx).Save(&model).Error; err != nil {
		return nil, err
	}
	return mapParcelModelToDomain(model), nil
}

func mapParcelDomainToModel(p *parcel.Parcel) gormmodels.Parcel {
	return gormmodels.Parcel{
		ID:            p.ID,
		ParcelCode:    p.ParcelCode,
		LockerID:      p.LockerID,
		CompartmentID: p.CompartmentID,
		Size:          p.Size,
		CourierID:     p.CourierID,
		RecipientID:   p.RecipientID,
		Status:        string(p.Status),
		ReservedAt:    p.ReservedAt,
		DepositedAt:   p.DepositedAt,
		PickedUpAt:    p.PickedUpAt,
		ExpiresAt:     p.ExpiresAt,
		CreatedAt:     p.CreatedAt,
		UpdatedAt:     p.UpdatedAt,
	}
}

func mapParcelModelToDomain(model gormmodels.Parcel) *parcel.Parcel {
	domainParcel := &parcel.Parcel{
		ID:            model.ID,
		ParcelCode:    model.ParcelCode,
		LockerID:      model.LockerID,
		CompartmentID: model.CompartmentID,
		Size:          model.Size,
		CourierID:     model.CourierID,
		RecipientID:   model.RecipientID,
		Status:        parcel.Status(model.Status),
		ReservedAt:    model.ReservedAt,
		DepositedAt:   model.DepositedAt,
		PickedUpAt:    model.PickedUpAt,
		ExpiresAt:     model.ExpiresAt,
		CreatedAt:     model.CreatedAt,
		UpdatedAt:     model.UpdatedAt,
	}

	return domainParcel
}
