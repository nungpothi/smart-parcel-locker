package template

import (
	"time"

	"github.com/google/uuid"
)

// Template represents a sample domain entity used as a blueprint for future modules.
type Template struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name        string    `gorm:"size:255;not null"`
	Description string    `gorm:"size:500"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
