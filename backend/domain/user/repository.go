package user

import (
	"context"

	"github.com/google/uuid"
)

// Repository defines data access for users.
type Repository interface {
	Create(ctx context.Context, u *User) (*User, error)
	GetByPhone(ctx context.Context, phone string) (*User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*User, error)
}
