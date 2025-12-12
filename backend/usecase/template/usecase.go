package template

import (
	"context"

	"smart-parcel-locker/backend/domain/template"
)

// UseCase orchestrates template application logic.
type UseCase struct {
	repo template.Repository
}

type Input struct {
	// TODO: add request parameters.
}

type Output struct {
	Entity *template.Template
}

func NewUseCase(repo template.Repository) *UseCase {
	return &UseCase{repo: repo}
}

// Execute runs the template use case.
func (uc *UseCase) Execute(ctx context.Context, input Input) (*Output, error) {
	// TODO: implement application logic.
	return &Output{}, nil
}
