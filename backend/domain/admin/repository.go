package admin

import (
	"context"

	"github.com/google/uuid"
)

// Repository defines CRUD operations for Admin.
type Repository interface {
	Create(ctx context.Context, admin *Admin) (*Admin, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Admin, error)
	Update(ctx context.Context, admin *Admin) (*Admin, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
