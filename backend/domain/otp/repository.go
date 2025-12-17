package otp

import "context"

// Repository provides OTP persistence.
type Repository interface {
	Create(ctx context.Context, otp *OTP) (*OTP, error)
	GetActiveByPhone(ctx context.Context, phone string) (*OTP, error)
	Update(ctx context.Context, otp *OTP) (*OTP, error)
}
