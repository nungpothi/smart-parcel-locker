package template

import (
	"context"
	"testing"

	"github.com/google/uuid"

	"smart-parcel-locker/backend/domain/template"
)

type fakeRepository struct{}

func (f *fakeRepository) Create(ctx context.Context, entity *template.Template) (*template.Template, error) {
	return entity, nil
}

func (f *fakeRepository) GetByID(ctx context.Context, id string) (*template.Template, error) {
	return &template.Template{ID: uuid.MustParse(id)}, nil
}

func (f *fakeRepository) List(ctx context.Context) ([]template.Template, error) {
	return []template.Template{}, nil
}

func (f *fakeRepository) Update(ctx context.Context, entity *template.Template) (*template.Template, error) {
	return entity, nil
}

func (f *fakeRepository) Delete(ctx context.Context, id string) error {
	return nil
}

func TestUseCaseCRUDSignatures(t *testing.T) {
	uc := NewUseCase(&fakeRepository{}, nil, nil, nil)
	ctx := context.Background()

	if _, err := uc.Create(ctx, CreateInput{Name: "demo"}); err != nil {
		t.Fatalf("create expected no error, got %v", err)
	}

	id := uuid.New().String()
	if _, err := uc.Get(ctx, id); err != nil {
		t.Fatalf("get expected no error, got %v", err)
	}

	if _, err := uc.Update(ctx, UpdateInput{ID: id, Name: "updated"}); err != nil {
		t.Fatalf("update expected no error, got %v", err)
	}

	if err := uc.Delete(ctx, id); err != nil {
		t.Fatalf("delete expected no error, got %v", err)
	}
}
