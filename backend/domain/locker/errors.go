package locker

import "smart-parcel-locker/backend/pkg/errorx"

var (
	ErrNoAvailableSlot        = errorx.Error{Code: "LOCKER_NO_AVAILABLE_SLOT", Message: "no available compartment"}
	ErrInvalidDeposit         = errorx.Error{Code: "LOCKER_INVALID_DEPOSIT", Message: "invalid deposit"}
	ErrParcelNotFound         = errorx.Error{Code: "LOCKER_PARCEL_NOT_FOUND", Message: "parcel not found in locker"}
	ErrLockerInactive         = errorx.Error{Code: "LOCKER_INACTIVE", Message: "locker is not active"}
	ErrCompartmentInvalidSize = errorx.Error{Code: "LOCKER_INVALID_SIZE", Message: "invalid compartment size"}
)
