package parcel

import "smart-parcel-locker/backend/pkg/errorx"

var (
	ErrParcelNotFound = errorx.Error{Code: "PARCEL_NOT_FOUND", Message: "parcel not found"}
)
