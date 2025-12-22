package admin

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/admin"
	"smart-parcel-locker/backend/pkg/logger"
)

// UseCase handles admin CRUD operations.
type UseCase struct {
	repo admin.Repository
}

type CreateInput struct {
	Username     string
	PasswordHash string
	Role         string
}

type UpdateInput struct {
	ID           uuid.UUID
	Username     string
	PasswordHash string
	Role         string
}

func NewUseCase(repo admin.Repository) *UseCase {
	return &UseCase{repo: repo}
}

func (uc *UseCase) Create(ctx context.Context, input CreateInput) (*admin.Admin, error) {
	logger.Info(ctx, "admin usecase create started", map[string]interface{}{
		"username": input.Username,
		"role":     input.Role,
	}, "")
	entity := &admin.Admin{
		Username:     input.Username,
		PasswordHash: input.PasswordHash,
		Role:         input.Role,
	}
	// TODO: add validations.
	created, err := uc.repo.Create(ctx, entity)
	if err != nil {
		logger.Error(ctx, "admin usecase create failed unexpectedly", map[string]interface{}{
			"username": input.Username,
			"role":     input.Role,
			"error":    err.Error(),
		}, "")
		return nil, err
	}
	logger.Info(ctx, "admin usecase created", map[string]interface{}{
		"adminId":  created.ID,
		"username": created.Username,
		"role":     created.Role,
	}, "")
	return created, nil
}

func (uc *UseCase) Get(ctx context.Context, id uuid.UUID) (*admin.Admin, error) {
	logger.Info(ctx, "admin usecase get started", map[string]interface{}{
		"adminId": id.String(),
	}, "")
	result, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Warn(ctx, "admin usecase get not found", map[string]interface{}{
				"adminId": id.String(),
			}, "")
		} else {
			logger.Error(ctx, "admin usecase get failed unexpectedly", map[string]interface{}{
				"adminId": id.String(),
				"error":   err.Error(),
			}, "")
		}
		return nil, err
	}
	logger.Info(ctx, "admin usecase retrieved", map[string]interface{}{
		"adminId":  result.ID,
		"username": result.Username,
		"role":     result.Role,
	}, "")
	return result, nil
}

func (uc *UseCase) Update(ctx context.Context, input UpdateInput) (*admin.Admin, error) {
	logger.Info(ctx, "admin usecase update started", map[string]interface{}{
		"adminId":  input.ID.String(),
		"username": input.Username,
		"role":     input.Role,
	}, "")
	entity := &admin.Admin{
		ID:           input.ID,
		Username:     input.Username,
		PasswordHash: input.PasswordHash,
		Role:         input.Role,
	}
	// TODO: add validations.
	updated, err := uc.repo.Update(ctx, entity)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Warn(ctx, "admin usecase update not found", map[string]interface{}{
				"adminId": input.ID.String(),
			}, "")
		} else {
			logger.Error(ctx, "admin usecase update failed unexpectedly", map[string]interface{}{
				"adminId": input.ID.String(),
				"error":   err.Error(),
			}, "")
		}
		return nil, err
	}
	logger.Info(ctx, "admin usecase updated", map[string]interface{}{
		"adminId":  updated.ID,
		"username": updated.Username,
		"role":     updated.Role,
	}, "")
	return updated, nil
}

func (uc *UseCase) Delete(ctx context.Context, id uuid.UUID) error {
	logger.Info(ctx, "admin usecase delete started", map[string]interface{}{
		"adminId": id.String(),
	}, "")
	if err := uc.repo.Delete(ctx, id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Warn(ctx, "admin usecase delete not found", map[string]interface{}{
				"adminId": id.String(),
			}, "")
		} else {
			logger.Error(ctx, "admin usecase delete failed unexpectedly", map[string]interface{}{
				"adminId": id.String(),
				"error":   err.Error(),
			}, "")
		}
		return err
	}
	logger.Info(ctx, "admin usecase deleted", map[string]interface{}{
		"adminId": id.String(),
	}, "")
	return nil
}
