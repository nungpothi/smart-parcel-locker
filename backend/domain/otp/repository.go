package otp

import "context"

// Repository provides OTP persistence.
type Repository interface {
	Create(ctx context.Context, otp *OTP) (*OTP, error)
	GetByRefAndPhone(ctx context.Context, otpRef string, phone string) (*OTP, error)
	Update(ctx context.Context, otp *OTP) (*OTP, error)
}
