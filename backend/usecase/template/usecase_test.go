package template

import (
	"context"
	"testing"

	"smart-parcel-locker/backend/domain/template"
)

type fakeRepository struct{}

func (f *fakeRepository) Create(ctx context.Context, entity template.Template) error {
	return nil
}

func (f *fakeRepository) FindByID(ctx context.Context, id uint) (*template.Template, error) {
	return &template.Template{ID: id}, nil
}

func TestUseCaseExecute(t *testing.T) {
	uc := NewUseCase(&fakeRepository{})
	output, err := uc.Execute(context.Background(), Input{})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if output == nil {
		t.Fatal("expected output, got nil")
	}
}
