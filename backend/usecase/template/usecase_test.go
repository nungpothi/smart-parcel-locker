package template

import (
	"context"
	"testing"

	"smart-parcel-locker/backend/domain/template"
)

type fakeRepository struct{}

func (f *fakeRepository) Create(ctx context.Context, entity template.Template) (*template.Template, error) {
	return &entity, nil
}

func (f *fakeRepository) GetByID(ctx context.Context, id uint) (*template.Template, error) {
	return &template.Template{ID: id}, nil
}

func (f *fakeRepository) Update(ctx context.Context, entity template.Template) (*template.Template, error) {
	return &entity, nil
}

func (f *fakeRepository) Delete(ctx context.Context, id uint) error {
	return nil
}

func TestUseCaseCRUDSignatures(t *testing.T) {
	uc := NewUseCase(&fakeRepository{})
	ctx := context.Background()

	if _, err := uc.Create(ctx, CreateInput{Name: "demo"}); err != nil {
		t.Fatalf("create expected no error, got %v", err)
	}

	if _, err := uc.Get(ctx, 1); err != nil {
		t.Fatalf("get expected no error, got %v", err)
	}

	if _, err := uc.Update(ctx, UpdateInput{ID: 1, Name: "updated"}); err != nil {
		t.Fatalf("update expected no error, got %v", err)
	}

	if err := uc.Delete(ctx, 1); err != nil {
		t.Fatalf("delete expected no error, got %v", err)
	}
}
