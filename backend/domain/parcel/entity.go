package parcel

import (
	"time"

	"github.com/google/uuid"
)

// Status enumerates parcel lifecycle states.
type Status string

const (
	StatusPending   Status = "PENDING"
	StatusDeposited Status = "DEPOSITED"
	StatusRetrieved Status = "RETRIEVED"
	StatusExpired   Status = "EXPIRED"
)

// Parcel represents a package stored in a locker.
type Parcel struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	LockerID    uuid.UUID `gorm:"type:uuid;index;not null"`
	SlotID      uuid.UUID `gorm:"type:uuid;index;not null"`
	PickupCode  string    `gorm:"size:255;uniqueIndex;not null"`
	Size        int       `gorm:"not null"`
	Status      Status    `gorm:"size:20;not null"`
	DepositedAt time.Time `gorm:"not null"`
	RetrievedAt *time.Time
	ExpiredAt   *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// SetStatus updates the parcel status.
func (p *Parcel) SetStatus(status Status) {
	p.Status = status
}
