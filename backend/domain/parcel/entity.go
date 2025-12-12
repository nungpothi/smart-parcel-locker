package parcel

import (
	"time"

	"github.com/google/uuid"
)

// Parcel represents a package stored in a locker.
type Parcel struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	LockerID  uuid.UUID `gorm:"type:uuid;index"`
	SlotID    uuid.UUID `gorm:"type:uuid;index"`
	Status    string    `gorm:"size:50"`
	Size      int
	CreatedAt time.Time
	UpdatedAt time.Time
	// TODO: add sender/recipient details in future phases.
}

// SetStatus updates the parcel status.
func (p *Parcel) SetStatus(status string) {
	p.Status = status
}
