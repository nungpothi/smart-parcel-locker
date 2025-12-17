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

func (r *GormRepository) GetByID(ctx context.Context, id uuid.UUID) (*parcel.Parcel, error) {
	var model gormmodels.Parcel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return mapParcelModelToDomain(model), nil
}

func (r *GormRepository) CountByStatus(ctx context.Context, statuses []parcel.Status) (int64, error) {
	if len(statuses) == 0 {
		return 0, nil
	}
	var count int64
	strStatuses := make([]string, 0, len(statuses))
	for _, s := range statuses {
		strStatuses = append(strStatuses, string(s))
	}
	if err := r.db.WithContext(ctx).
		Model(&gormmodels.Parcel{}).
		Where("status IN ?", strStatuses).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func mapParcelModelToDomain(model gormmodels.Parcel) *parcel.Parcel {
	return &parcel.Parcel{
		ID:            model.ID,
		ParcelCode:    model.ParcelCode,
		LockerID:      model.LockerID,
		CompartmentID: model.CompartmentID,
		Size:          model.Size,
		ReceiverPhone: model.ReceiverPhone,
		SenderPhone:   model.SenderPhone,
		PickupCode:    model.PickupCode,
		Status:        parcel.Status(model.Status),
		ReservedAt:    model.ReservedAt,
		DepositedAt:   model.DepositedAt,
		PickedUpAt:    model.PickedUpAt,
		ExpiresAt:     model.ExpiresAt,
		CreatedAt:     model.CreatedAt,
		UpdatedAt:     model.UpdatedAt,
	}
}
