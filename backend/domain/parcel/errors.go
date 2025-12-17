package parcel

import "smart-parcel-locker/backend/pkg/errorx"

var (
	ErrInvalidRequest = errorx.Error{Code: "INVALID_REQUEST", Message: "invalid request"}
	ErrParcelNotFound = errorx.Error{Code: "PARCEL_NOT_FOUND", Message: "parcel not found"}
)
