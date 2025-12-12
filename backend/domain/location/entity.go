package location

import (
	"time"

	"github.com/google/uuid"
)

// Location represents a locker location.
type Location struct {
	ID        uuid.UUID
	Code      string
	Name      string
	Address   *string
	IsActive  bool
	CreatedAt time.Time
	UpdatedAt *time.Time
}
