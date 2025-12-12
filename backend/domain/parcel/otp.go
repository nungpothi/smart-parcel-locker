package parcel

import (
	"time"

	"github.com/google/uuid"
)

const (
	OTPStatusActive   = "ACTIVE"
	OTPStatusVerified = "VERIFIED"
	OTPStatusExpired  = "EXPIRED"
)

// OTP represents an OTP linked to a parcel.
type OTP struct {
	ID         uuid.UUID
	ParcelID   uuid.UUID
	OTPRef     string
	OTPHash    string
	Status     string
	ExpiresAt  time.Time
	VerifiedAt *time.Time
	CreatedAt  time.Time
}

// Verify marks OTP as verified when active and not expired.
func (o *OTP) Verify(now time.Time) error {
	if o.Status != OTPStatusActive {
		return ErrOTPInvalid
	}
	if now.After(o.ExpiresAt) || now.Equal(o.ExpiresAt) {
		o.Status = OTPStatusExpired
		return ErrOTPExpired
	}
	o.Status = OTPStatusVerified
	o.VerifiedAt = &now
	return nil
}

// Expire marks OTP as expired.
func (o *OTP) Expire() {
	o.Status = OTPStatusExpired
}
