package template

import "context"

// Repository defines data access behavior for Template entities.
type Repository interface {
	Create(ctx context.Context, entity *Template) (*Template, error)
	GetByID(ctx context.Context, id string) (*Template, error)
	List(ctx context.Context) ([]Template, error)
	Update(ctx context.Context, entity *Template) (*Template, error)
	Delete(ctx context.Context, id string) error
}
