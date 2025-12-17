package otp

import (
	"time"

	"github.com/google/uuid"
)

type Status string

const (
	StatusActive   Status = "ACTIVE"
	StatusVerified Status = "VERIFIED"
	StatusExpired  Status = "EXPIRED"
)

// OTP represents a one-time password request.
type OTP struct {
	ID         uuid.UUID
	Phone      string
	OtpRef     string
	OtpHash    string
	Status     Status
	ExpiresAt  time.Time
	VerifiedAt *time.Time
	CreatedAt  time.Time
}
