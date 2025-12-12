package template

import (
	"context"

	"smart-parcel-locker/backend/domain/template"
)

// UseCase orchestrates template application logic.
type UseCase struct {
	repo template.Repository
}

type CreateInput struct {
	Name string
}

type UpdateInput struct {
	ID   uint
	Name string
}

func NewUseCase(repo template.Repository) *UseCase {
	return &UseCase{repo: repo}
}

// Create adds a new Template.
func (uc *UseCase) Create(ctx context.Context, input CreateInput) (*template.Template, error) {
	entity := template.Template{
		Name: input.Name,
	}
	if uc.repo == nil {
		return &entity, nil
	}
	// TODO: add validation and business rules.
	return uc.repo.Create(ctx, entity)
}

// Get retrieves a Template by ID.
func (uc *UseCase) Get(ctx context.Context, id uint) (*template.Template, error) {
	if uc.repo == nil {
		return &template.Template{ID: id}, nil
	}
	// TODO: add business rules.
	return uc.repo.GetByID(ctx, id)
}

// Update modifies an existing Template.
func (uc *UseCase) Update(ctx context.Context, input UpdateInput) (*template.Template, error) {
	entity := template.Template{
		ID:   input.ID,
		Name: input.Name,
	}
	if uc.repo == nil {
		return &entity, nil
	}
	// TODO: add validation and business rules.
	return uc.repo.Update(ctx, entity)
}

// Delete removes a Template by ID.
func (uc *UseCase) Delete(ctx context.Context, id uint) error {
	if uc.repo == nil {
		return nil
	}
	// TODO: add business rules.
	return uc.repo.Delete(ctx, id)
}
