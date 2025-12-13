package user

import (
	"time"

	"github.com/google/uuid"
)

// User represents a system user who can authenticate.
type User struct {
	ID           uuid.UUID
	Phone        string
	PasswordHash string
	UserType     string
	CreatedAt    time.Time
}

const (
	TypeAdmin     = "ADMIN"
	TypeCourier   = "COURIER"
	TypeRecipient = "RECIPIENT"
)
