package user

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/user"
	gormmodels "smart-parcel-locker/backend/infrastructure/persistence/gorm/models"
)

// GormRepository provides data access for users.
type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) WithDB(db *gorm.DB) user.Repository {
	return &GormRepository{db: db}
}

func (r *GormRepository) Create(ctx context.Context, u *user.User) (*user.User, error) {
	model := gormmodels.User{
		ID:           u.ID,
		UserType:     u.UserType,
		Phone:        &u.Phone,
		PasswordHash: u.PasswordHash,
		CreatedAt:    time.Now(),
	}
	if model.ID == uuid.Nil {
		model.ID = uuid.New()
	}
	if err := r.db.WithContext(ctx).Create(&model).Error; err != nil {
		return nil, err
	}
	return mapUserModelToDomain(model), nil
}

func (r *GormRepository) GetByPhone(ctx context.Context, phone string) (*user.User, error) {
	var model gormmodels.User
	if err := r.db.WithContext(ctx).Where("phone = ?", phone).First(&model).Error; err != nil {
		return nil, err
	}
	return mapUserModelToDomain(model), nil
}

func (r *GormRepository) GetByID(ctx context.Context, id uuid.UUID) (*user.User, error) {
	var model gormmodels.User
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return mapUserModelToDomain(model), nil
}

func mapUserModelToDomain(model gormmodels.User) *user.User {
	u := &user.User{
		ID:           model.ID,
		UserType:     model.UserType,
		PasswordHash: model.PasswordHash,
		CreatedAt:    model.CreatedAt,
	}
	if model.Phone != nil {
		u.Phone = *model.Phone
	}
	return u
}

// ensure interface compliance
var _ user.Repository = (*GormRepository)(nil)
