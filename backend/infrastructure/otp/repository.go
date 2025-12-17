package otp

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/otp"
	gormmodels "smart-parcel-locker/backend/infrastructure/persistence/gorm/models"
)

// GormRepository provides data access for OTPs.
type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) WithDB(db *gorm.DB) otp.Repository {
	return &GormRepository{db: db}
}

func (r *GormRepository) Create(ctx context.Context, entity *otp.OTP) (*otp.OTP, error) {
	model := gormmodels.ParcelOTP{
		ID:         entity.ID,
		Phone:      entity.Phone,
		OtpRef:     entity.OtpRef,
		OtpHash:    entity.OtpHash,
		Status:     string(entity.Status),
		ExpiresAt:  entity.ExpiresAt,
		VerifiedAt: entity.VerifiedAt,
		CreatedAt:  entity.CreatedAt,
	}
	if model.ID == uuid.Nil {
		model.ID = uuid.New()
	}
	if model.CreatedAt.IsZero() {
		model.CreatedAt = time.Now()
	}
	if err := r.db.WithContext(ctx).Create(&model).Error; err != nil {
		return nil, err
	}
	return mapModelToDomain(model), nil
}

func (r *GormRepository) GetByRefAndPhone(ctx context.Context, otpRef string, phone string) (*otp.OTP, error) {
	var model gormmodels.ParcelOTP
	if err := r.db.WithContext(ctx).
		Where("phone = ? AND otp_ref = ?", phone, otpRef).
		First(&model).Error; err != nil {
		return nil, err
	}
	return mapModelToDomain(model), nil
}

func (r *GormRepository) Update(ctx context.Context, entity *otp.OTP) (*otp.OTP, error) {
	if entity == nil {
		return nil, gorm.ErrInvalidData
	}
	model := gormmodels.ParcelOTP{
		ID:         entity.ID,
		Phone:      entity.Phone,
		OtpRef:     entity.OtpRef,
		OtpHash:    entity.OtpHash,
		Status:     string(entity.Status),
		ExpiresAt:  entity.ExpiresAt,
		VerifiedAt: entity.VerifiedAt,
		CreatedAt:  entity.CreatedAt,
	}
	if err := r.db.WithContext(ctx).Save(&model).Error; err != nil {
		return nil, err
	}
	return mapModelToDomain(model), nil
}

func mapModelToDomain(model gormmodels.ParcelOTP) *otp.OTP {
	return &otp.OTP{
		ID:         model.ID,
		Phone:      model.Phone,
		OtpRef:     model.OtpRef,
		OtpHash:    model.OtpHash,
		Status:     otp.Status(model.Status),
		ExpiresAt:  model.ExpiresAt,
		VerifiedAt: model.VerifiedAt,
		CreatedAt:  model.CreatedAt,
	}
}
