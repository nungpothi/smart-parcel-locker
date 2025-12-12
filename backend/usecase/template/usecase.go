package template

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/template"
	"smart-parcel-locker/backend/infrastructure/database"
)

// UseCase orchestrates template application logic with transactional boundaries.
type UseCase struct {
	repo        template.Repository
	db          *gorm.DB
	tx          *database.TransactionManager
	repoFactory func(db *gorm.DB) template.Repository
}

type CreateInput struct {
	Name        string
	Description string
}

type UpdateInput struct {
	ID          string
	Name        string
	Description string
}

func NewUseCase(repo template.Repository, db *gorm.DB, tx *database.TransactionManager, repoFactory func(db *gorm.DB) template.Repository) *UseCase {
	return &UseCase{
		repo:        repo,
		db:          db,
		tx:          tx,
		repoFactory: repoFactory,
	}
}

// Create adds a new Template.
func (uc *UseCase) Create(ctx context.Context, input CreateInput) (*template.Template, error) {
	entity := &template.Template{
		Name:        input.Name,
		Description: input.Description,
	}
	return uc.runInTx(ctx, func(repo template.Repository) (*template.Template, error) {
		// TODO: add validation and business rules.
		return repo.Create(ctx, entity)
	})
}

// Get retrieves a Template by ID.
func (uc *UseCase) Get(ctx context.Context, id string) (*template.Template, error) {
	return uc.repo.GetByID(ctx, id)
}

func (uc *UseCase) List(ctx context.Context) ([]template.Template, error) {
	return uc.repo.List(ctx)
}

// Update modifies an existing Template.
func (uc *UseCase) Update(ctx context.Context, input UpdateInput) (*template.Template, error) {
	entity := &template.Template{
		ID:          uuid.MustParse(input.ID),
		Name:        input.Name,
		Description: input.Description,
	}
	return uc.runInTx(ctx, func(repo template.Repository) (*template.Template, error) {
		// TODO: add validation and business rules.
		return repo.Update(ctx, entity)
	})
}

// Delete removes a Template by ID.
func (uc *UseCase) Delete(ctx context.Context, id string) error {
	_, err := uc.runInTx(ctx, func(repo template.Repository) (*template.Template, error) {
		return nil, repo.Delete(ctx, id)
	})
	return err
}

func (uc *UseCase) runInTx(ctx context.Context, fn func(repo template.Repository) (*template.Template, error)) (*template.Template, error) {
	if uc.tx == nil {
		return fn(uc.repo)
	}

	var res *template.Template
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		repo := uc.repo
		if uc.repoFactory != nil && tx != nil {
			repo = uc.repoFactory(tx)
		}
		var err error
		res, err = fn(repo)
		return err
	})
	if err != nil {
		return nil, err
	}
	return res, nil
}
