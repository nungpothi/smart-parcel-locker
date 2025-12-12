package admin

import (
	"context"

	"github.com/google/uuid"

	"smart-parcel-locker/backend/domain/admin"
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
	entity := &admin.Admin{
		Username:     input.Username,
		PasswordHash: input.PasswordHash,
		Role:         input.Role,
	}
	// TODO: add validations.
	return uc.repo.Create(ctx, entity)
}

func (uc *UseCase) Get(ctx context.Context, id uuid.UUID) (*admin.Admin, error) {
	return uc.repo.GetByID(ctx, id)
}

func (uc *UseCase) Update(ctx context.Context, input UpdateInput) (*admin.Admin, error) {
	entity := &admin.Admin{
		ID:           input.ID,
		Username:     input.Username,
		PasswordHash: input.PasswordHash,
		Role:         input.Role,
	}
	// TODO: add validations.
	return uc.repo.Update(ctx, entity)
}

func (uc *UseCase) Delete(ctx context.Context, id uuid.UUID) error {
	return uc.repo.Delete(ctx, id)
}
