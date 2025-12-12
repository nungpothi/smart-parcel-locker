package parcel

import (
	"time"

	"github.com/google/uuid"
)

// Event captures parcel timeline transitions.
type Event struct {
	ID        uuid.UUID
	ParcelID  uuid.UUID
	EventType string
	CreatedAt time.Time
}
