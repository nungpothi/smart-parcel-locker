package compartment

import "smart-parcel-locker/backend/pkg/errorx"

var (
	ErrInvalidCompartmentStatus = errorx.Error{Code: "COMPARTMENT_INVALID_STATUS", Message: "invalid compartment status"}
)
