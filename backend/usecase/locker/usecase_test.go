package locker

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/compartment"
	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/domain/parcel"
)

type fakeLockerRepo struct {
	locker locker.Locker
}

func (r *fakeLockerRepo) GetLockerWithCompartments(ctx context.Context, lockerID uuid.UUID) (*locker.Locker, error) {
	return &r.locker, nil
}

func (r *fakeLockerRepo) UpdateCompartment(ctx context.Context, c *compartment.Compartment) (*compartment.Compartment, error) {
	return c, nil
}

func (r *fakeLockerRepo) WithDB(db *gorm.DB) locker.Repository { return r }

type fakeParcelRepo struct{}

func (r *fakeParcelRepo) Create(ctx context.Context, p *parcel.Parcel) (*parcel.Parcel, error) {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return p, nil
}

func (r *fakeParcelRepo) GetByID(ctx context.Context, id uuid.UUID) (*parcel.Parcel, error) {
	return &parcel.Parcel{ID: id}, nil
}

func (r *fakeParcelRepo) Update(ctx context.Context, p *parcel.Parcel) (*parcel.Parcel, error) {
	return p, nil
}

func (r *fakeParcelRepo) WithDB(db *gorm.DB) parcel.Repository { return r }

func TestDepositUseCaseExecute(t *testing.T) {
	lockerRepo := &fakeLockerRepo{
		locker: locker.Locker{
			ID: uuid.New(),
			Compartments: []compartment.Compartment{
				{ID: uuid.New(), LockerID: uuid.New(), Size: "S", Status: compartment.StatusAvailable},
			},
		},
	}
	parcelRepo := &fakeParcelRepo{}
	uc := NewDepositUseCase(lockerRepo, parcelRepo, nil)

	result, err := uc.Execute(context.Background(), DepositInput{LockerID: lockerRepo.locker.ID, ParcelSize: 1})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if result == nil {
		t.Fatal("expected parcel result")
	}
}
