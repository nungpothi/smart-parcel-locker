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
	if tx == nil {
		tx = database.NewTransactionManager(nil)
	}
	if repoFactory == nil {
		if r, ok := repo.(interface {
			WithDB(*gorm.DB) template.Repository
		}); ok {
			repoFactory = func(db *gorm.DB) template.Repository { return r.WithDB(db) }
		} else {
			repoFactory = func(db *gorm.DB) template.Repository { return repo }
		}
	}
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
	var created *template.Template
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		repo := uc.repoFactory(tx)
		// TODO: add validation and business rules.
		var err error
		created, err = repo.Create(ctx, entity)
		return err
	})
	if err != nil {
		return nil, err
	}
	return created, nil
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
	var updated *template.Template
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		repo := uc.repoFactory(tx)
		// TODO: add validation and business rules.
		var err error
		updated, err = repo.Update(ctx, entity)
		return err
	})
	if err != nil {
		return nil, err
	}
	return updated, nil
}

// Delete removes a Template by ID.
func (uc *UseCase) Delete(ctx context.Context, id string) error {
	return uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		repo := uc.repoFactory(tx)
		// TODO: add business rules.
		return repo.Delete(ctx, id)
	})
}
