package parcel

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

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
	now := time.Now()
	model := gormmodels.Parcel{
		ID:            p.ID,
		ParcelCode:    p.ParcelCode,
		LockerID:      p.LockerID,
		CompartmentID: p.CompartmentID,
		Size:          p.Size,
		ReceiverPhone: p.ReceiverPhone,
		SenderPhone:   p.SenderPhone,
		PickupCode:    p.PickupCode,
		Status:        string(p.Status),
		DepositedAt:   p.DepositedAt,
		PickedUpAt:    p.PickedUpAt,
		ExpiresAt:     p.ExpiresAt,
		CreatedAt:     now,
		UpdatedAt:     &now,
	}
	if model.ID == uuid.Nil {
		model.ID = uuid.New()
	}
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

func (r *GormRepository) GetByIDForUpdate(ctx context.Context, id uuid.UUID) (*parcel.Parcel, error) {
	var model gormmodels.Parcel
	if err := r.db.WithContext(ctx).
		Clauses(clause.Locking{Strength: "UPDATE"}).
		First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return mapParcelModelToDomain(model), nil
}

func (r *GormRepository) Update(ctx context.Context, p *parcel.Parcel) (*parcel.Parcel, error) {
	if p == nil {
		return nil, nil
	}
	now := time.Now()
	model := gormmodels.Parcel{
		ID:            p.ID,
		ParcelCode:    p.ParcelCode,
		LockerID:      p.LockerID,
		CompartmentID: p.CompartmentID,
		Size:          p.Size,
		ReceiverPhone: p.ReceiverPhone,
		SenderPhone:   p.SenderPhone,
		PickupCode:    p.PickupCode,
		Status:        string(p.Status),
		DepositedAt:   p.DepositedAt,
		PickedUpAt:    p.PickedUpAt,
		ExpiresAt:     p.ExpiresAt,
		UpdatedAt:     &now,
	}
	if err := r.db.WithContext(ctx).
		Model(&gormmodels.Parcel{}).
		Where("id = ?", p.ID).
		Updates(model).Error; err != nil {
		return nil, err
	}
	p.UpdatedAt = &now
	return p, nil
}

func (r *GormRepository) CreateEvent(ctx context.Context, event *parcel.Event) error {
	model := gormmodels.ParcelEvent{
		ID:        event.ID,
		ParcelID:  event.ParcelID,
		EventType: event.EventType,
		CreatedAt: event.CreatedAt,
	}
	if model.ID == uuid.Nil {
		model.ID = uuid.New()
	}
	if model.CreatedAt.IsZero() {
		model.CreatedAt = time.Now()
	}
	return r.db.WithContext(ctx).Create(&model).Error
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

func (r *GormRepository) ListReadyForPickupByPhone(ctx context.Context, phone string) ([]*parcel.Parcel, error) {
	var models []gormmodels.Parcel
	if err := r.db.WithContext(ctx).
		Where("status = ?", string(parcel.StatusReadyForPickup)).
		Where("receiver_phone = ? OR sender_phone = ?", phone, phone).
		Order("created_at ASC").
		Find(&models).Error; err != nil {
		return nil, err
	}
	results := make([]*parcel.Parcel, 0, len(models))
	for _, model := range models {
		results = append(results, mapParcelModelToDomain(model))
	}
	return results, nil
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
		DepositedAt:   model.DepositedAt,
		PickedUpAt:    model.PickedUpAt,
		ExpiresAt:     model.ExpiresAt,
		CreatedAt:     model.CreatedAt,
		UpdatedAt:     model.UpdatedAt,
	}
}
