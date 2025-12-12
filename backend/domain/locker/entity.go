package locker

import (
	"time"

	"github.com/google/uuid"

	"smart-parcel-locker/backend/domain/compartment"
	"smart-parcel-locker/backend/domain/parcel"
)

// Locker represents a locker bank containing multiple compartments.
type Locker struct {
	ID           uuid.UUID
	LocationID   uuid.UUID
	LockerCode   string
	Name         string
	Status       string
	Compartments []compartment.Compartment
	CreatedAt    time.Time
	UpdatedAt    *time.Time
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

// SelectBestFitCompartment finds the best compartment for a parcel.
func (s *LockerService) SelectBestFitCompartment(p *parcel.Parcel) (*compartment.Compartment, error) {
	for i := range s.locker.Compartments {
		if s.locker.Compartments[i].Status == compartment.StatusAvailable {
			return &s.locker.Compartments[i], nil
		}
	}
	return nil, ErrNoAvailableSlot
}

// MarkOccupied sets the compartment as occupied by the parcel.
func (s *LockerService) MarkOccupied(c *compartment.Compartment, parcelID uuid.UUID) {
	c.Status = compartment.StatusOccupied
	c.ParcelID = &parcelID
}

// ReleaseCompartment frees up a compartment when a parcel is retrieved.
func (s *LockerService) ReleaseCompartment(c *compartment.Compartment) {
	c.Status = compartment.StatusAvailable
	c.ParcelID = nil
}
