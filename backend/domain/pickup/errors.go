package pickup

import "smart-parcel-locker/backend/pkg/errorx"

var (
	ErrInvalidToken = errorx.Error{Code: "INVALID_TOKEN", Message: "invalid token"}
	ErrTokenExpired = errorx.Error{Code: "TOKEN_EXPIRED", Message: "token expired"}
)
