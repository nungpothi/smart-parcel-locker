package user

import (
	"time"

	"github.com/google/uuid"
)

const (
	TypeAdmin     = "ADMIN"
	TypeCourier   = "COURIER"
	TypeRecipient = "RECIPIENT"
)

// User represents a system user (admin, courier, or recipient).
type User struct {
	ID          uuid.UUID
	UserType    string
	Phone       *string
	DisplayName *string
	CreatedAt   time.Time
}
