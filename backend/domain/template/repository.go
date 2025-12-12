package template

import "context"

// Repository defines data access behavior for Template entities.
type Repository interface {
	Create(ctx context.Context, entity Template) error
	FindByID(ctx context.Context, id uint) (*Template, error)
}
