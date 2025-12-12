package locker

import "context"

// Repository defines data access for lockers and slots.
type Repository interface {
	GetLockerWithSlots(ctx context.Context, lockerID uint) (*Locker, error)
	UpdateSlot(ctx context.Context, slot *Slot) (*Slot, error)
}
