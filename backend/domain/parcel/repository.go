package parcel

import (
	"context"
	"time"

	"github.com/google/uuid"
)

// Repository defines data access for parcels.
type Repository interface {
	Create(ctx context.Context, parcel *Parcel) (*Parcel, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Parcel, error)
	GetByRecipientAndStatus(ctx context.Context, recipientID uuid.UUID, status Status) (*Parcel, error)
	Update(ctx context.Context, parcel *Parcel) (*Parcel, error)
	CreateEvent(ctx context.Context, event *Event) error
	CreateOTP(ctx context.Context, otp *OTP) (*OTP, error)
	GetOTPByRef(ctx context.Context, ref string) (*OTP, error)
	UpdateOTP(ctx context.Context, otp *OTP) (*OTP, error)
	FindReadyToExpire(ctx context.Context, now time.Time) ([]Parcel, error)
	ExpireActiveOTPs(ctx context.Context, parcelID uuid.UUID) error
	CountByStatus(ctx context.Context, statuses []Status) (int64, error)
}
