package admin

import (
	"time"

	"github.com/google/uuid"
)

// Admin represents a minimal administrative user.
type Admin struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Email     string    `gorm:"size:255;uniqueIndex;not null"`
	Name      string    `gorm:"size:255;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
