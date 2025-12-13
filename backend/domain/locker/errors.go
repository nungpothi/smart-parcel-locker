package locker

import "smart-parcel-locker/backend/pkg/errorx"

var (
	ErrNoAvailableSlot        = errorx.Error{Code: "NO_AVAILABLE_COMPARTMENT", Message: "no available compartment"}
	ErrInvalidDeposit         = errorx.Error{Code: "INVALID_INPUT", Message: "invalid deposit"}
	ErrParcelNotFound         = errorx.Error{Code: "PARCEL_NOT_FOUND", Message: "parcel not found in locker"}
	ErrLockerInactive         = errorx.Error{Code: "LOCKER_INACTIVE", Message: "locker is not active"}
	ErrCompartmentInvalidSize = errorx.Error{Code: "INVALID_INPUT", Message: "invalid compartment size"}
)
