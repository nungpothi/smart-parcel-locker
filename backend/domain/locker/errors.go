package locker

import "smart-parcel-locker/backend/pkg/errorx"

var (
	ErrNoAvailableSlot = errorx.Error{Code: "LOCKER_NO_AVAILABLE_SLOT", Message: "no available slot"}
	ErrInvalidDeposit  = errorx.Error{Code: "LOCKER_INVALID_DEPOSIT", Message: "invalid deposit"}
	ErrParcelNotFound  = errorx.Error{Code: "LOCKER_PARCEL_NOT_FOUND", Message: "parcel not found in locker"}
)
