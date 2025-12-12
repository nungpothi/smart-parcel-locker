package locker

import (
	"context"

	"github.com/google/uuid"
)

// Repository defines data access for lockers and slots.
type Repository interface {
	GetLockerWithSlots(ctx context.Context, lockerID uuid.UUID) (*Locker, error)
	UpdateSlot(ctx context.Context, slot *Slot) (*Slot, error)
}
