package locker

import (
	"context"
	"testing"

	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/domain/parcel"
)

type fakeLockerRepo struct {
	locker locker.Locker
}

func (r *fakeLockerRepo) GetLockerWithSlots(ctx context.Context, lockerID uint) (*locker.Locker, error) {
	return &r.locker, nil
}

func (r *fakeLockerRepo) UpdateSlot(ctx context.Context, slot *locker.Slot) (*locker.Slot, error) {
	return slot, nil
}

type fakeParcelRepo struct{}

func (r *fakeParcelRepo) Create(ctx context.Context, p *parcel.Parcel) (*parcel.Parcel, error) {
	return p, nil
}

func (r *fakeParcelRepo) GetByID(ctx context.Context, id uint) (*parcel.Parcel, error) {
	return &parcel.Parcel{ID: id}, nil
}

func (r *fakeParcelRepo) Update(ctx context.Context, p *parcel.Parcel) (*parcel.Parcel, error) {
	return p, nil
}

func TestDepositUseCaseExecute(t *testing.T) {
	lockerRepo := &fakeLockerRepo{
		locker: locker.Locker{
			ID: 1,
			Slots: []locker.Slot{
				{ID: 1, LockerID: 1, Size: 1, Occupied: false},
			},
		},
	}
	parcelRepo := &fakeParcelRepo{}
	uc := NewDepositUseCase(lockerRepo, parcelRepo, nil)

	result, err := uc.Execute(context.Background(), DepositInput{LockerID: 1, ParcelSize: 1})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if result == nil {
		t.Fatal("expected parcel result")
	}
}
