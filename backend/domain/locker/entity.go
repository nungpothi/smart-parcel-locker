package locker

import (
	"time"

	"github.com/google/uuid"

	"smart-parcel-locker/backend/domain/parcel"
)

// Locker represents a locker bank containing multiple slots.
type Locker struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Code      string    `gorm:"size:255;uniqueIndex;not null"`
	Name      string    `gorm:"size:255"`
	Location  string    `gorm:"size:255"`
	Slots     []Slot    `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// Slot represents an individual compartment in a locker.
type Slot struct {
	ID        uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	LockerID  uuid.UUID  `gorm:"type:uuid;not null;index"`
	Size      int        `gorm:"not null"`
	Occupied  bool       `gorm:"not null;default:false"`
	ParcelID  *uuid.UUID `gorm:"type:uuid"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// LockerService encapsulates locker business rules using receiver methods.
type LockerService struct {
	locker *Locker
}

func NewLockerService(locker *Locker) *LockerService {
	return &LockerService{locker: locker}
}

// ValidateDeposit ensures the locker can accept the parcel.
func (s *LockerService) ValidateDeposit(p *parcel.Parcel) error {
	// TODO: add validation rules (size checks, availability, status).
	return nil
}

// SelectBestFitSlot finds the best slot for a parcel.
func (s *LockerService) SelectBestFitSlot(p *parcel.Parcel) (*Slot, error) {
	// TODO: implement best-fit selection logic.
	for i := range s.locker.Slots {
		if !s.locker.Slots[i].Occupied {
			return &s.locker.Slots[i], nil
		}
	}
	return nil, ErrNoAvailableSlot
}

// MarkOccupied sets the slot as occupied by the parcel.
func (s *LockerService) MarkOccupied(slot *Slot, parcelID uuid.UUID) {
	slot.Occupied = true
	slot.ParcelID = &parcelID
}

// ReleaseSlot frees up a slot when a parcel is retrieved.
func (s *LockerService) ReleaseSlot(slot *Slot) {
	slot.Occupied = false
	slot.ParcelID = nil
}
