package compartment

import "smart-parcel-locker/backend/pkg/errorx"

var (
	ErrInvalidCompartmentStatus = errorx.Error{Code: "INVALID_STATUS_TRANSITION", Message: "invalid compartment status"}
)
