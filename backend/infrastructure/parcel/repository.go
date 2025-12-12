package parcel

import (
	"context"
	"time"

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
	if err := r.db.WithContext(ctx).Create(&model).Error; err != nil {
		return err
	}
	return nil
}

func (r *GormRepository) CreateOTP(ctx context.Context, otp *parcel.OTP) (*parcel.OTP, error) {
	model := gormmodels.ParcelOTP{
		ID:         otp.ID,
		ParcelID:   otp.ParcelID,
		OtpRef:     otp.OTPRef,
		OtpHash:    otp.OTPHash,
		Status:     otp.Status,
		ExpiresAt:  otp.ExpiresAt,
		VerifiedAt: otp.VerifiedAt,
		CreatedAt:  otp.CreatedAt,
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
	return mapOTPModelToDomain(model), nil
}

func (r *GormRepository) GetOTPByRef(ctx context.Context, ref string) (*parcel.OTP, error) {
	var model gormmodels.ParcelOTP
	if err := r.db.WithContext(ctx).Where("otp_ref = ?", ref).Order("created_at desc").First(&model).Error; err != nil {
		return nil, err
	}
	return mapOTPModelToDomain(model), nil
}

func (r *GormRepository) UpdateOTP(ctx context.Context, otp *parcel.OTP) (*parcel.OTP, error) {
	model := gormmodels.ParcelOTP{
		ID:         otp.ID,
		ParcelID:   otp.ParcelID,
		OtpRef:     otp.OTPRef,
		OtpHash:    otp.OTPHash,
		Status:     otp.Status,
		ExpiresAt:  otp.ExpiresAt,
		VerifiedAt: otp.VerifiedAt,
		CreatedAt:  otp.CreatedAt,
	}
	if err := r.db.WithContext(ctx).Save(&model).Error; err != nil {
		return nil, err
	}
	return mapOTPModelToDomain(model), nil
}

func (r *GormRepository) FindReadyToExpire(ctx context.Context, now time.Time) ([]parcel.Parcel, error) {
	var models []gormmodels.Parcel
	if err := r.db.WithContext(ctx).
		Where("status = ?", string(parcel.StatusPickupReady)).
		Where("expires_at IS NOT NULL AND expires_at <= ?", now).
		Find(&models).Error; err != nil {
		return nil, err
	}
	parcels := make([]parcel.Parcel, 0, len(models))
	for _, m := range models {
		parcels = append(parcels, *mapParcelModelToDomain(m))
	}
	return parcels, nil
}

func (r *GormRepository) ExpireActiveOTPs(ctx context.Context, parcelID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&gormmodels.ParcelOTP{}).
		Where("parcel_id = ? AND status = ?", parcelID, parcel.OTPStatusActive).
		Updates(map[string]interface{}{"status": parcel.OTPStatusExpired}).Error
}

func (r *GormRepository) CountByStatus(ctx context.Context, statuses []parcel.Status) (int64, error) {
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

func mapOTPModelToDomain(model gormmodels.ParcelOTP) *parcel.OTP {
	return &parcel.OTP{
		ID:         model.ID,
		ParcelID:   model.ParcelID,
		OTPRef:     model.OtpRef,
		OTPHash:    model.OtpHash,
		Status:     model.Status,
		ExpiresAt:  model.ExpiresAt,
		VerifiedAt: model.VerifiedAt,
		CreatedAt:  model.CreatedAt,
	}
}
